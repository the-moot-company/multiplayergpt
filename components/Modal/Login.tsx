import {
  HiOutlineClipboard,
  HiOutlineCreditCard,
  HiOutlineDeviceMobile,
  HiOutlineGlobeAlt,
  HiOutlineKey,
} from 'react-icons/hi';

import HomeContext from '@/pages/api/home/home.context';

import Modal from '@/components/Modal/Modal';

const LoginModal = ({ isLoginModalOpen, closeLoginModal }) => {
  return (
    <Modal
      isDisplayed={isLoginModalOpen}
      onClose={closeLoginModal}
      displayCloseButton={false}
    >
      <div className="flex flex-col w-full p-6">
        <h3 className="mb-1 text-2xl font-medium">Login</h3>
        <p className="opacity-60 mb-8">
          Login coming soon. Register interest here.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 mb-2 gap-4">
          <div className="font-regular px-2 py-1 bg-base-200 rounded flex flex-row items-center">
            <HiOutlineClipboard className="mr-2" />
            Session history
          </div>
          <div className="font-regular px-2 py-1 bg-base-200 rounded flex flex-row items-center">
            <HiOutlineKey className="mr-2" />
            Use own API key
          </div>
          <div className="font-regular px-2 py-1 bg-base-200 rounded flex flex-row items-center">
            <HiOutlineDeviceMobile className="mr-2" />
            Use on multiple devices
          </div>
          <div className="font-regular px-2 py-1 bg-base-200 rounded flex flex-row items-center">
            <HiOutlineGlobeAlt className="mr-2" />
            Web search
          </div>
          <div className="font-regular px-2 py-1 bg-base-200 rounded flex flex-row items-center">
            <HiOutlineCreditCard className="mr-2" />
            Subscription
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={closeLoginModal}
            className="px-2 py-1 cursor-pointer rounded border border-base-300 bg-base-200 capitalize shadow-sm text-neutral hover:bg-base-300"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
