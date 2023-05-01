import HomeContext from '@/pages/api/home/home.context';

import Modal from '@/components/Modal/Modal';

const LoginModal = ({ isLoginModalOpen, closeLoginModal }) => {
  return (
    <Modal
      isDisplayed={isLoginModalOpen}
      onClose={closeLoginModal}
      displayCloseButton={false}
    >
      <div className="flex flex-col w-full">
        <h3 className="mb-1 text-lg font-medium">Login</h3>
        <p className="text-sm opacity-60 mb-4">Coming soon</p>
        <div className="mt-8 flex justify-end">
          <button
            onClick={closeLoginModal}
            className="btn-sm btn rounded border border-base-300 bg-base-200 capitalize shadow-sm text-neutral hover:border-primary-green hover:bg-primary-green hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
