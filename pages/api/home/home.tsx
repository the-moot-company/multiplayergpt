import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';
import { getSettings } from '@/utils/app/settings';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import Promptbar from '@/components/Promptbar';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
  initialConversations: any;
  room: any;
}

const userColors = [
  '#FF7262',
  '#F5BD80',
  '#F8DC61',
  '#CDF87F',
  '#94B1F5',
  '#C2C7F4',
  '#F6DBE1',
  '#EDF0F5',
];

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
  initialConversations,
  room,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);

  const roomId = room.id;

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState: { ...initialState, roomId, userPresences: [] },
  });

  const {
    state: {
      apiKey,
      lightMode,
      folders,
      conversations,
      selectedConversation,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const { data, error, refetch } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
  );

  useEffect(() => {
    if (data) dispatch({ field: 'models', value: data });
  }, [data, dispatch]);

  useEffect(() => {
    // const bob = async () => {
    //   const rooms = await supabase.from('room').select('*');

    // };
    // bob();
    dispatch({ field: 'modelError', value: getModelsError(error) });
  }, [dispatch, error, getModelsError]);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({ field: 'conversations', value: updatedConversations });
    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = async () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    // dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    const { data, error } = await supabase.from('conversation').insert([
      {
        id: newConversation.id,
        name: newConversation.name,
        roomId,
        prompt: newConversation.prompt,
        temperature: newConversation.temperature,
      },
    ]);

    dispatch({ field: 'loading', value: false });

    // @Incomplete don't dispatch if error
    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    // @Incomplete - update db
    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  // EFFECTS  --------------------------------------------
  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const channelName = `moot-${roomId}`;

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          // @Incomplete - should be the user's name?
          key: uuidv4(),
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const currentUsers = Object.values(presenceChannel.presenceState()).map(
          (entry) => entry[0],
        );

        dispatch({
          field: 'userPresences',
          value: currentUsers == null ? [] : currentUsers,
        });
      })
      .subscribe();

    const name = localStorage.getItem('name');

    presenceChannel.track({
      selectedConversationId: selectedConversation?.id,
      name: name && name !== '' ? name : 'Anonymous',
      colour: 'red',
    });
  }, [roomId, selectedConversation?.id]);

  useEffect(() => {
    const allConversationIds = conversations.map((c) => c.id);

    let errorToastId: undefined | string;

    const messageChannel = supabase
      .channel('message')
      .on(
        'postgres_changes',
        {
          schema: 'public',
          table: 'message',
          event: '*',
        },
        (payload) => {
          if (!allConversationIds.includes(payload.new.conversationId)) {
            return;
          }

          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;

            const updatedConversations = conversations.map((c) => {
              if (c.id === newMessage.conversationId) {
                return {
                  ...c,
                  messages: [...c.messages, newMessage],
                };
              }

              return c;
            });

            dispatch({ field: 'conversations', value: updatedConversations });

            if (newMessage.conversationId === selectedConversation?.id) {
              dispatch({
                field: 'selectedConversation',
                value: {
                  ...selectedConversation,
                  messages: [...selectedConversation.messages, newMessage],
                },
              });
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === 'TIMED_OUT') {
          console.error('Error subscribing to message channel', status);
          errorToastId = toast.error(
            'Connection failed, please refresh the page',
            {
              duration: Infinity,
            },
          );

          return;
        }

        if (errorToastId) {
          toast.dismiss(errorToastId);
        }
      });

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [selectedConversation?.id, conversations, dispatch]);

  useEffect(() => {
    let errorToastId: undefined | string;

    const conversationChannel = supabase
      .channel('conversation')
      .on(
        'postgres_changes',
        {
          schema: 'public',
          table: 'conversation',
          event: '*',
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newConversation = { ...payload.new, messages: [] };
            const updatedConversations = [...conversations, newConversation];

            dispatch({ field: 'conversations', value: updatedConversations });
          } else if (payload.eventType === 'UPDATE') {
            // @Incomplete - this won't have messages?
            const newConversation = payload.new;

            if (newConversation.deleted) {
              const updatedConversations = conversations.filter(
                (c) => c.id !== newConversation.id,
              );

              dispatch({ field: 'conversations', value: updatedConversations });

              if (newConversation.id === selectedConversation?.id) {
                // @Incomplete - should change selected conversation
                // dispatch({
                //   field: 'selectedConversation',
                //   value: null,
                // });
              }

              return;
            }

            const updatedConversations = conversations.map((c) => {
              if (c.id === newConversation.id) {
                return { ...c, ...newConversation };
              }

              return c;
            });

            dispatch({ field: 'conversations', value: updatedConversations });

            if (newConversation.id === selectedConversation?.id) {
              dispatch({
                field: 'loading',
                value: newConversation.loading,
              });

              // const oldConversationWithMessages = conversations.find(
              //   (c) => c.id === newConversation.id,
              // );

              // if (oldConversationWithMessages) {
              //   dispatch({
              //     field: 'selectedConversation',
              //     value: {
              //       ...oldConversationWithMessages,
              //       ...newConversation,
              //     },
              //   });
              // }
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === 'TIMED_OUT') {
          console.error('Error subscribing to message channel', status);
          errorToastId = toast.error(
            'Connection failed, please refresh the page',
            {
              duration: Infinity,
            },
          );

          return;
        }

        if (errorToastId) {
          toast.dismiss(errorToastId);
        }
      });

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [conversations, dispatch, roomId]);

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch({ field: 'pluginKeys', value: pluginKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
      dispatch({ field: 'showPromptbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({ field: 'folders', value: JSON.parse(folders) });
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }

    const conversationHistory = initialConversations;
    if (conversationHistory) {
      dispatch({ field: 'conversations', value: conversationHistory });
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {
      const lastConversation = conversationHistory[
        conversationHistory.length - 1
      ] || {
        id: uuidv4(),
        name: t('New Conversation'),
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        temperature: DEFAULT_TEMPERATURE,
        folderId: null,
      };

      dispatch({
        field: 'selectedConversation',
        value: lastConversation,
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
      }}
    >
      <Head>
        <title>Multiplayer GPT</title>
        <meta name="description" content="ChatGPT but multiplayer." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar />

            <div className="flex flex-1">
              <Chat stopConversationRef={stopConversationRef} />
            </div>

            {/* <Promptbar /> */}
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  let roomId = query.r as string | undefined;

  if (!roomId) {
    const { data: room, error } = await supabase
      .from('room')
      .insert([{}])
      .select()
      .single();

    // @Incomplete - error
    if (error) {
      console.error(error);
      return {
        notFound: true,
      };
    }

    return {
      redirect: {
        destination: `/?r=${room.id}`,
        permanent: false,
      },
    };
  }

  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  const { data: room } = await supabase
    .from('room')
    .select('*')
    .eq('id', roomId)
    .single();

  if (!room) {
    return {
      notFound: true,
    };
  }

  const { data: rawConversations } = await supabase
    .from('conversation')
    .select('*, message(*)')
    .order('createdAt', { ascending: true })
    .eq('roomId', roomId);

  const conversations = rawConversations?.map((conversation) => {
    const newConversation = {
      ...conversation,
    };

    delete newConversation.message;

    return {
      ...newConversation,
      messages: conversation.message,
      model: {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5',
        maxLength: 12000,
        tokenLimit: 4000,
      },
    };
  });

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      room,
      initialConversations: conversations,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
