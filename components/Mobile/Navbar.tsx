import { IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { HiOutlineUserAdd } from 'react-icons/hi';

import { Conversation } from '@/types/chat';

interface Props {
  selectedConversation: Conversation;
  onNewConversation: () => void;
}

export const Navbar: FC<Props> = ({
  selectedConversation,
  onNewConversation,
}) => {
  function handleCopyToClipboard() {
    toast.success('Invite link copied to clipboard.', {
      duration: 1500, // Set duration to 4 seconds (4000 milliseconds)
    });
  }

  return (
    <nav className="flex w-full justify-between py-4 px-4 bg-pixel-noise bg-repeat text-black bg-blue-300">
      <div className="mr-4"></div>

      <div className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
        {selectedConversation.name}
      </div>

      <CopyToClipboard text={window.location.href}>
        <button onClick={handleCopyToClipboard}>
          <HiOutlineUserAdd
            className="cursor-pointer hover:text-neutral-500 mt-.5"
            // add copy link
            // onClick={onNewConversation}
            size={20}
          />
        </button>
      </CopyToClipboard>
    </nav>
  );
};
