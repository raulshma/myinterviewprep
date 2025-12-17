import { SharedHeaderProvider } from '@/components/dashboard/shared-header-context';
import { SidebarPageWrapper } from '@/components/dashboard/sidebar-page-wrapper';
import { StreamingSidebarLayout } from '@/components/dashboard/streaming-sidebar-layout';

// Removed 'force-dynamic' to enable streaming and static shell generation

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedHeaderProvider>
      <StreamingSidebarLayout>
        <SidebarPageWrapper>{children}</SidebarPageWrapper>
      </StreamingSidebarLayout>
    </SharedHeaderProvider>
  );
}
