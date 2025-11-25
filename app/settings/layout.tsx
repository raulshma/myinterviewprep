import { Sidebar } from "@/components/dashboard/sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {children}
    </div>
  );
}
