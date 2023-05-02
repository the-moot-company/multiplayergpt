import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';

interface Props {
  onClick: any;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  return (
    <>
      <button
        className={`mt-2 flex md:hidden ${
          side === 'right' ? 'right-[270px]' : 'left-[270px]'
        } z-50 h-7 w-7 hover:text-gray-400 sm:top-0.5 sm:${
          side === 'right' ? 'right-[270px]' : 'left-[270px]'
        } sm:h-8 sm:w-8 sm:text-neutral-700`}
        onClick={onClick}
      >
        {side === 'right' ? (
          <IconArrowBarRight size={20} />
        ) : (
          <IconArrowBarLeft size={20} />
        )}
      </button>
      <div
        onClick={onClick}
        className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
      ></div>
    </>
  );
};

export const CloseSidebarButtonTwo = ({ onClick, side }: Props) => {
  return (
    <>
      <button
        className={`md:mt-3 mr-1 ${
          side === 'right' ? 'right-[270px]' : 'left-[270px]'
        } z-50 h-7 w-7 hover:text-gray-400 sm:top-0.5 sm:${
          side === 'right' ? 'right-[270px]' : 'left-[270px]'
        } sm:h-8 sm:w-8 sm:text-neutral-700`}
        onClick={onClick}
      >
        {side === 'right' ? <IconArrowBarRight /> : <IconArrowBarLeft />}
      </button>
    </>
  );
};

export const OpenSidebarButton = ({ onClick, side }: Props) => {
  return (
    <button
      className={`fixed top-1.5 md:top-2.5 ${
        side === 'right' ? 'right-2' : 'left-2'
      } z-50 h-7 w-7 text-black hover:text-gray-400 sm:top-0.5 sm:${
        side === 'right' ? 'right-2' : 'left-2 ml-1 mt-2'
      } sm:h-8 sm:w-8 text-black`}
      onClick={onClick}
    >
      {side === 'right' ? <IconArrowBarLeft /> : <IconArrowBarRight />}
    </button>
  );
};
