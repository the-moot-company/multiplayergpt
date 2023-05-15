import { useState } from 'react';
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
  const [emailSubmission, setEmailSubmission] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (e) => {
    // prevent redirect
    e.preventDefault();

    setIsLoading(true);

    try {
      const encodedEmail = encodeURIComponent(emailSubmission);
      const responseBody = `userGroup=MultiplayerGPT&email==${encodedEmail}`;

      await fetch(
        'https://app.loops.so/api/newsletter-form/clb3wx92d05ugl908ywh1v1mj',
        {
          method: 'POST',
          body: responseBody,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // const json = await response.json()

      setEmailSubmission('');
      setIsLoading(false);
      setIsSubmitted(true);

      // use the response constant here
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      isDisplayed={isLoginModalOpen}
      onClose={closeLoginModal}
      displayCloseButton={false}
    >
      <div className="flex flex-col w-full p-6">
        <div className="flex flex-row items-center">
          <h3 className="text-md md:text-xl font-medium mr-2">
            Login to MultiplayerGPT
          </h3>
          <div className="bg-base-100 rounded-full px-2 text-xs py-1">
            coming soon
          </div>
        </div>
        <div className="mt-2 max-w-xl text-sm opacity-60 mb-2">
          <p>
            Get early access to{' '}
            <a
              href="https://moot.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-moot-primary font-medium hover:underline"
            >
              Moot
            </a>{' '}
            products -- including multiplayerGPT.
          </p>
        </div>
        {!isSubmitted ? (
          <form
            className="mt-5 flex flex-col md:flex-row items-center mb-1"
            id="newsletter-form"
            onSubmit={onSubmit}
          >
            <div className="w-full sm:max-w-xs">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={emailSubmission}
                onChange={(e) => setEmailSubmission(e.target.value)}
                className="flex border border-base-300 md:mb-0 h-10 px-2 w-full rounded-md shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="you@email.com"
              />
            </div>
            {!isLoading ? (
              <button className="mt-4 md:mt-0 bg-moot-primary border-none hover:shadow-lg hover:shadow-primary-fade bg-gradient-button rounded-md inline-flex w-full items-center justify-center border border-transparent bg-primary px-4 py-2 font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Submit{' '}
              </button>
            ) : (
              <button className="mt-4 md:mt-0 bg-moot-primary loading border-none hover:shadow-lg hover:shadow-primary-fade bg-gradient-button rounded-md inline-flex w-full items-center justify-center border border-transparent bg-primary px-4 py-2 font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Submit{' '}
              </button>
            )}
          </form>
        ) : (
          <div className="mt-2 max-w-xl text-sm opacity-60 bg-base-200 rounded-md p-2">
            <p>{"Great! We'll send you an email to confirm 🌐✨"}</p>
          </div>
        )}
        {/* <h3 className="mb-1 text-2xl font-medium">Login</h3>
        <p className="opacity-60 mb-8 md:mb-4">
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
        </div> */}
      </div>
    </Modal>
  );
};

export default LoginModal;
