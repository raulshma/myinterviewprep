import { Suspense } from "react";
import { getSidebarData } from "./sidebar";
import { SidebarUi } from "./sidebar-ui";
import { ResponsiveSidebarLayout } from "./responsive-sidebar-layout";
import { SidebarLayoutSkeleton } from "./sidebar-layout-skeleton";

/**
 * Async component that fetches sidebar data and renders the full layout.
 * Wrapped in Suspense by the parent to enable streaming.
 */
async function SidebarLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = await getSidebarData();

  return (
    <ResponsiveSidebarLayout
      sidebarData={sidebarData}
      desktopSidebar={<SidebarUi data={sidebarData} />}
    >
      {children}
    </ResponsiveSidebarLayout>
  );
}

/**
 * Streaming sidebar layout wrapper.
 * Shows a skeleton immediately while sidebar data loads in the background.
 */
export function StreamingSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<SidebarLayoutSkeleton>{children}</SidebarLayoutSkeleton>}>
      <SidebarLayoutContent>{children}</SidebarLayoutContent>
    </Suspense>
  );
}
