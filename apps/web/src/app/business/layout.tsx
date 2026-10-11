import { BusinessShell } from "@/components/business-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BusinessShell>{children}</BusinessShell>;
}
