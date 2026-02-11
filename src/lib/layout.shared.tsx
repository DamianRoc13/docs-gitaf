import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <Image
          src="/gitaf.svg"
          alt="GITAF"
          width={80}
          height={15}
          priority
        />
      ),
    },
  };
}
