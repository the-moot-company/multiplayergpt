import {
  IconArrowRight,
  IconFolderPlus,
  IconMistOff,
  IconPlus,
} from '@tabler/icons-react';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Image from 'next/image';
import Link from 'next/link';

import HomeContext from '@/pages/api/home/home.context';

import {
  CloseSidebarButton,
  CloseSidebarButtonTwo,
  OpenSidebarButton,
} from './components/OpenCloseButton';

import Search from '../Search';

interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  folderComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleCreateFolder: () => void;
  handleDrop: (e: any) => void;
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  folderComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleCreateFolder,
  handleDrop,
}: Props<T>) => {
  const {
    state: {
      selectedConversation,
      prompts,
      loading,
      messageIsStreaming,
      userPresences,
      userTyping,
      name,
      userColor,
    },
    presenceChannelRef,

    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [inputValue, setInputValue] = useState(name);

  const { t } = useTranslation('promptbar');

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  useEffect(() => {
    const storedValue = localStorage.getItem('name');
    if (storedValue) {
      console.log('storedValue', storedValue);
      setInputValue(storedValue);
    } else {
      presenceChannelRef.current.track({
        selectedConversationId: selectedConversation?.id,
        name: inputValue && inputValue !== '' ? inputValue : 'Anonymous',
        color: userColor,
      });
      homeDispatch({
        field: 'name',
        value: inputValue,
      });
    }
  }, []);

  useEffect(() => {
    const storedValue = localStorage.getItem('color');
    if (storedValue) {
      homeDispatch({
        field: 'userColor',
        value: storedValue,
      });
    } else {
      localStorage.setItem('color', userColor);
    }
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    localStorage.setItem('name', value);
    homeDispatch({
      field: 'name',
      value,
    });
  };

  return isOpen ? (
    <div>
      <div
        className={`fixed top-0 ${side}-0 z-40 w-[280px] flex h-full flex-col bg-base-100 text-[14px] transition-all sm:relative sm:top-0 text-black border-r border-base-300`}
      >
        <div className="flex flex-row justify-between">
          <a
            href="https://moot.app/"
            rel="noopener noreferrer"
            target="_blank"
            className="flex cursor-pointer items-center justify-start p-4"
          >
            <div className="flex mr-2 mt-.5">
              <Image
                alt="Moot logo"
                height={16}
                width={16}
                src="/images/logo-svg.svg"
                priority
              />
            </div>
            <div className="flex flex-row items-center justify-center">
              <h2 className="antialised flex text-lg font-medium">
                MultiplayerGPT
              </h2>{' '}
              {/* <p className="text-xs ml-1"> by Moot</p> */}
            </div>
          </a>
          <div className="flex">
            <CloseSidebarButtonTwo onClick={toggleOpen} side={side} />
          </div>
        </div>
        <div className="space-y-2 m-3 flex flex-col pb-2">
          <p className="text-xs uppercase opacity-60 pl-1 font-medium">Name</p>
          <input
            type="text"
            placeholder="Jarvis"
            className="rounded-md border border-base-300 bg-base-200 p-2 h-12 flex items-center"
            value={inputValue}
            onChange={handleChange}
          />
        </div>
        <div
          className={`flex flex-col space-y-2 p-3 text-[14px] transition-all sm:relative sm:top-0 border-t border-base-300 pt-6`}
        >
          <p className="text-xs uppercase font-medium opacity-60 pl-1">
            Your sessions
          </p>
          <div className="flex items-center">
            {false ? (
              <button
                className="text-sidebar flex w-full flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-base-300 p-3 text-black transition-colors duration-200 hover:bg-gray-500/10"
                onClick={() => {
                  handleCreateItem();
                  handleSearchTerm('');
                }}
              >
                <IconPlus size={16} />
                {addItemButtonTitle}
              </button>
            ) : (
              <div className="flex flex-col pb-2">
                <div className="rounded-md border border-base-300 bg-base-200 p-3 items-start flex flex-col">
                  <p className="opacity-60 mb-2">
                    You need to login to see your session history.
                  </p>
                  <p className="text-primary-green">Login now</p>
                </div>
              </div>
            )}

            {/* <button
            className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={handleCreateFolder}
          >
            <IconFolderPlus size={16} />
          </button> */}
          </div>
          {/* <Search
          placeholder={t('Search...') || ''}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        /> */}

          <div className="flex-grow overflow-auto">
            {items?.length > 0 && <div className="flex">{folderComponent}</div>}

            {items?.length > 0 && (
              <div
                className="pt-0"
                onDrop={handleDrop}
                onDragOver={allowDrop}
                onDragEnter={highlightDrop}
                onDragLeave={removeHighlight}
              >
                {itemComponent}
              </div>
            )}
          </div>
          {footerComponent}
        </div>
        <div
          className={`flex flex-col space-y-2 p-3 text-[14px] transition-all sm:relative sm:top-0 border-t border-base-300 pt-6`}
        >
          <p className="text-xs uppercase font-medium opacity-60 pl-1 mb-1">
            Need help?
          </p>
          <a
            href="https://twitter.com/moot_hq"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p className="flex flex-row pl-1 text-blue-500">
              Tweet us @moot_hq <IconArrowRight className="ml-2" size={20} />
            </p>
          </a>
        </div>
      </div>
      <CloseSidebarButton onClick={toggleOpen} side={side} />
    </div>
  ) : (
    <OpenSidebarButton onClick={toggleOpen} side={side} />
  );
};

export default Sidebar;
