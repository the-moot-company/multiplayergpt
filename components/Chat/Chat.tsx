import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import {
  HiOutlineBookOpen,
  HiOutlineLightBulb,
  HiOutlineUser,
  HiOutlineUserAdd,
} from 'react-icons/hi';

import { useTranslation } from 'next-i18next';

import { getEndpoint } from '@/utils/app/api';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';
import { Plugin } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { TemperatureSlider } from './Temperature';

import supabase from '@/lib/supabase';
import { log } from 'console';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

const getInitials = (name: string) => {
  if (!name || typeof name !== 'string') return '';

  const initials = name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return initials;
};

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
      userPresences,
    },
    handleUpdateConversation,
    dispatch,
  } = useContext(HomeContext);

  const homeDispatch = useCallback(
    async (action) => {
      if (action.field === 'loading') {
        const { error } = await supabase
          .from('conversation')
          .update({ loading: action.value })
          .eq('id', selectedConversation?.id)
          .single();
      }
    },
    [selectedConversation?.id],
  );

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }

        const { error } = await supabase.from('message').insert([
          {
            author: localStorage.getItem('name') ?? 'Anonymous',
            conversationId: selectedConversation.id,
            role: message.role,
            content: message.content,
          },
        ]);

        // @Incomplete - error handling
        if (error) {
          console.error(error);
        }

        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: updatedConversation.messages,
          key: apiKey,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
        };
        const endpoint = getEndpoint(plugin);
        let body;
        if (!plugin) {
          body = JSON.stringify(chatBody);
        } else {
          body = JSON.stringify({
            ...chatBody,
            googleAPIKey: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
            googleCSEId: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
          });
        }
        const controller = new AbortController();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        if (!response.ok) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }
        if (!plugin) {
          if (updatedConversation.messages.length === 1) {
            const { content } = message;
            const customName =
              content.length > 30 ? content.substring(0, 30) + '...' : content;
            updatedConversation = {
              ...updatedConversation,
              name: customName,
            };

            // update name of the conversation on supabase
            const { error } = await supabase
              .from('conversation')
              .update({ name: customName })
              .eq('id', selectedConversation.id);

            // @Incomplete - error handling
            if (error) {
              console.error(error);
            }
          }

          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let isFirst = true;
          let text = '';
          let messageId = '';
          while (!done) {
            if (stopConversationRef.current === true) {
              controller.abort();
              done = true;
              break;
            }
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            text += chunkValue;
            if (isFirst) {
              isFirst = false;
              const updatedMessages: Message[] = [
                ...updatedConversation.messages,
                { role: 'assistant', content: chunkValue },
              ];
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
              const newMessage = { role: 'assistant', content: text };
              const { data: newSupabaseMessage, error } = await supabase
                .from('message')
                .upsert([
                  {
                    conversationId: selectedConversation.id,
                    role: newMessage.role,
                    content: newMessage.content,
                    author: localStorage.getItem('name') ?? 'Anonymous',
                  },
                ])
                .select('id')
                .single();

              // @Incomplete - error handling
              if (error) {
                console.error(error);
              }
              messageId = newSupabaseMessage?.id;
            } else {
              const updatedMessages: Message[] =
                updatedConversation.messages.map((message, index) => {
                  if (index === updatedConversation.messages.length - 1) {
                    return {
                      ...message,
                      content: text,
                    };
                  }
                  return message;
                });
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };

              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
              const newMessage = {
                role: 'assistant',
                content: text,
              };
              const { data: message, error } = await supabase
                .from('message')
                .upsert([
                  {
                    id: messageId,
                    conversationId: selectedConversation.id,
                    role: newMessage.role,
                    content: newMessage.content,
                    author: localStorage.getItem('name') ?? 'Anonymous',
                  },
                ]);

              // @Incomplete - error handling
              if (error) {
                console.error(error);
              }
            }
          }
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          // homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'messageIsStreaming', value: false });

          const newMessage = { role: 'assistant', content: text };
          homeDispatch({ field: 'loading', value: false });

          const { data: message, error } = await supabase
            .from('message')
            .upsert([
              {
                id: messageId,
                conversationId: selectedConversation.id,
                role: newMessage.role,
                content: newMessage.content,
                author: localStorage.getItem('name') ?? 'Anonymous',
              },
            ]);

          // @Incomplete - error handling
          if (error) {
            console.error(error);
          }
        } else {
          const { answer } = await response.json();
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: answer },
          ];
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
          homeDispatch({
            field: 'selectedConversation',
            value: updateConversation,
          });
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({
            field: 'conversations',
            value: updatedConversations,
          });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
      }
    },
    [
      apiKey,
      conversations,
      pluginKeys,
      selectedConversation,
      stopConversationRef,
      homeDispatch,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  // useEffect(() => {
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  function handleCopyToClipboard() {
    toast.success('Invite link copied to clipboard.', {
      duration: 1500, // Set duration to 4 seconds (4000 milliseconds)
    });
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-pixel-noise">
      <div className="flex flex-row hidden md:flex md:absolute top-0 right-0 items-center z-10">
        {userPresences.slice(0, 3).map((userPresence) => (
          <div
            key={userPresence.id}
            className="group relative  bg-moot-primary rounded-full h-6 w-6 flex items-center justify-center ring-2 ring-base-100 -mr-2"
            style={{
              backgroundColor: userPresence.color,
            }}
          >
            {getInitials(userPresence.name)}
            <div
              className="absolute hidden top-0 bg-gray-200 text-gray-800 px-2 py-1 rounded mt-2 text-sm group-hover:block z-[11] text-white"
              style={{
                backgroundColor: userPresence.color,
              }}
            >
              {userPresence.name}
            </div>
          </div>
        ))}
        {userPresences.length > 3 && (
          <div className="group relative bg-moot-primary rounded-full h-6 w-6 flex items-center justify-center ring-2 ring-base-100 -mr-2 z-[11]">
            +{userPresences.length - 3}
            <div className="absolute hidden top-0 bg-moot-primary text-gray-800 px-2 py-1 rounded mt-2 text-sm group-hover:block z-[11] text-white">
              {userPresences.slice(3).map((userPresence) => (
                <p key={userPresence.id}>{userPresence.name}</p>
              ))}
            </div>
          </div>
        )}
        <CopyToClipboard
          text={navigator.clipboard.writeText(window.location.href)}
        >
          <button onClick={handleCopyToClipboard} className="p-2 text-black">
            <HiOutlineUserAdd size={24} />
          </button>
        </CopyToClipboard>
      </div>
      {!(apiKey || serverSideApiKeyIsSet) ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-medium text-black mb-2">
            Welcome to MultiplayerGPT
          </div>
          <div className="text-center text-xl font-medium text-black">
            MultiplayerGPT is a project by Moot, the all-in-one collaborative
            workspace for remote teams
          </div>
          <div className="text-center text-lg text-black">
            <div className="mb-8">{`MultiplayerGPT is largely written on top of Chatbot UI, an open source clone of OpenAI's ChatGPT UI.`}</div>
          </div>
          <div className="text-center text-gray-500">
            <div className="mb-2">
              MultiplayerGPT allows you to plug in your API key to use this UI
              with their API.
            </div>
            <div className="mb-2">
              It is <span className="italic">only</span> used to communicate
              with their API.
            </div>
            <div className="mb-2">
              {t(
                'Please set your OpenAI API key in the bottom left of the sidebar.',
              )}
            </div>
            <div>
              {t("If you don't have an OpenAI API key, you can get one here: ")}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                openai.com
              </a>
            </div>
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages?.length === 0 ? (
              <>
                <div className="mx-auto flex flex-col space-y-5 px-3 md:pt-5 md:pt-6 sm:max-w-[720px]">
                  <div className="">
                    {models.length === 0 ? (
                      <div>
                        <Spinner size="16px" className="mx-auto" />
                      </div>
                    ) : null}
                  </div>

                  {models.length > 0 && (
                    <div className="flex flex-col">
                      <div className="flex h-full flex-col space-y-4 rounded-xl bg-base-100 border border-base-300 p-6 mb-6">
                        <div className="flex flex-col text-center">
                          <div className="hidden md:flex flex-row items-end mb-2">
                            <p className="text-lg md:text-3xl font-medium text-gray-800 text-left">
                              MultiplayerGPT
                            </p>
                            <p className="md:text-lg font-medium text-gray-800 text-left ml-1">
                              by Moot
                            </p>
                          </div>
                          <p className="hidden md:flex stext-sm md:text-md font-regular text-gray-800 opacity-60 text-left mb-4 md:w-4/5">
                            Multiplayer GPT is a multiplayer chatGPT experience
                            by Moot - it allows collaboration between multiple
                            users. Try for free, login for more features.
                          </p>
                        </div>
                        <ModelSelect />

                        <SystemPrompt
                          conversation={selectedConversation}
                          prompts={prompts}
                          onChangePrompt={(prompt) =>
                            handleUpdateConversation(selectedConversation, {
                              key: 'prompt',
                              value: prompt,
                            })
                          }
                        />

                        <TemperatureSlider
                          label={t('Temperature')}
                          onChangeTemperature={(temperature) =>
                            handleUpdateConversation(selectedConversation, {
                              key: 'temperature',
                              value: temperature,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-row items-center justify-center text-black flex-wrap sm:flex-nowrap">
                        <div className="mb-2 mx-2 px-4 py-2 bg-primary-red rounded-full text-white shadow-sm flex flex-row items-center justify-center cursor-pointer">
                          <HiOutlineUser className="mr-2" />
                          Select character
                        </div>
                        <div className="mb-2 mx-2 px-4 py-2 bg-primary-blue rounded-full text-white shadow-sm flex flex-row items-center justify-center cursor-pointer">
                          <HiOutlineBookOpen className="mr-2" /> Prompt library
                        </div>
                        <div className="mb-2 mx-2 px-4 py-2 bg-primary-green rounded-full text-white shadow-sm flex flex-row items-center justify-center cursor-pointer">
                          <HiOutlineLightBulb className="mr-2" />
                          See Usecases
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )}

                {selectedConversation?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedConversation?.messages.length - index,
                      );
                    }}
                  />
                ))}

                {/* {loading && <ChatLoader />} */}

                <div className="h-[162px]" ref={messagesEndRef} />
              </>
            )}
          </div>

          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message, plugin) => {
              setCurrentMessage(message);
              handleSend(message, 0, plugin);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2, null);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
