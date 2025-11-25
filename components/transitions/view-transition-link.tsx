'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition, type ComponentProps, type ReactNode } from 'react';

interface ViewTransitionLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  children: ReactNode;
  viewTransitionName?: string;
}

export function ViewTransitionLink({
  href,
  children,
  viewTransitionName,
  style,
  ...props
}: ViewTransitionLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = typeof href === 'string' ? href : href.pathname || '/';

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        startTransition(() => {
          router.push(url);
        });
      });
    } else {
      startTransition(() => {
        router.push(url);
      });
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      style={{
        ...style,
        viewTransitionName,
      } as React.CSSProperties}
      data-pending={isPending ? '' : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
