import { ClientShell } from "@/components/client-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}
