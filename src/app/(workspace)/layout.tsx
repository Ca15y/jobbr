import { AppShell } from "@/components/app-shell";
import { getViewer } from "@/lib/applications";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return (
    <AppShell email={viewer.email} preview={viewer.preview}>
      {children}
    </AppShell>
  );
}
