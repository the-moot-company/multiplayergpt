import { IconScriptX } from '@tabler/icons-react';
import { useCallback } from 'react';
import ROModal from 'react-overlays/Modal';

import className from 'classnames';

type ModalProps = {
  children: React.ReactNode;
  isDisplayed: boolean;
  onClose: () => void;
  displayCloseButton?: boolean;
  isFixedSize?: boolean;
  transparent?: boolean;
  blur?: boolean;
};

function Modal({
  children,
  isDisplayed,
  displayCloseButton,
  isFixedSize,
  onClose,
  transparent = false,
  blur = false,
}: ModalProps) {
  const renderBackdrop = useCallback(
    (props) => {
      return (
        <div
          {...props}
          style={
            blur
              ? {
                  position: 'fixed',
                  zIndex: '1040',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                }
              : {
                  position: 'fixed',
                  zIndex: '1040',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: '#000',
                  opacity: '0.5',
                }
          }
        />
      );
    },
    [blur],
  );

  return (
    <ROModal
      show={isDisplayed}
      onHide={onClose}
      renderBackdrop={renderBackdrop}
      aria-labelledby="modal-label"
    >
      <div
        data-theme="light"
        className={className(
          'max-w-screen-lg',
          'fixed z-[1041]',
          transparent
            ? 'bg-transparent'
            : 'rounded-xl bg-base-100 border border-base-300',
          { 'p-6  w-full md:w-auto': !isFixedSize },
          { 'w-[90%] h-[90%]': isFixedSize },
          'sm:max-w-full', // Add this to make the modal full width on small screens
        )}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {displayCloseButton && (
          <button
            className="absolute right-2 top-2 btn btn-ghost btn-sm"
            onClick={onClose}
          >
            <IconScriptX size={18} className="text-current" />
          </button>
        )}
        {children}
      </div>
    </ROModal>
  );
}

export default Modal;
