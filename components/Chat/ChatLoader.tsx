import { FC } from 'react';

import Image from 'next/image';

interface Props {}

export const ChatLoader: FC<Props> = () => {
  return (
    <div
      className="group border-b border-black/10 bg-gray-50 text-gray-800"
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="m-auto flex gap-4 p-4 text-base md:max-w-xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-2xl">
        <div className="min-w-[16px] items-end">
          <div className="flex items-center justify-center p-2 bg-moot-primary rounded">
            <Image
              src="/images/logo-svg.svg"
              alt="Logo"
              className="invert"
              width={12}
              height={12}
            />
          </div>
        </div>
        <span className="animate-pulse cursor-default mt-1">▍</span>
      </div>
    </div>
  );
};
