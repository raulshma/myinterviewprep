'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode, type ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigatingLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  children: ReactNode;
  /** Optional class name for the loading indicator container */
  loadingClassName?: string;
  /** Whether to show a loading spinner when navigating */
  showSpinner?: boolean;
  /** Custom spinner size in tailwind classes */
  spinnerSize?: string;
  /** Position the spinner replaces or overlays the children */
  spinnerMode?: 'replace' | 'append' | 'prepend';
}

/**
 * A Link component that shows instant navigation feedback with a loading spinner.
 * Use this for navigation links that benefit from visual loading state.
 */
export function NavigatingLink({
  href,
  children,
  className,
  loadingClassName,
  showSpinner = true,
  spinnerSize = 'w-4 h-4',
  spinnerMode = 'append',
  ...props
}: NavigatingLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = typeof href === 'string' ? href : href.pathname || '/';
    
    startTransition(() => {
      router.push(url);
    });
  };

  const spinner = showSpinner && isPending && (
    <Loader2 className={cn(spinnerSize, 'animate-spin')} />
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(className, isPending && loadingClassName)}
      data-pending={isPending ? '' : undefined}
      {...props}
    >
      {spinnerMode === 'replace' && isPending ? (
        spinner
      ) : spinnerMode === 'prepend' ? (
        <>
          {spinner}
          {children}
        </>
      ) : spinnerMode === 'append' ? (
        <>
          {children}
          {spinner}
        </>
      ) : (
        children
      )}
    </Link>
  );
}
