import { RouteTransition } from "@/components/route-transition";
import { Entry } from "@/features/cliente/entry";

export default function Page() {
  return (
    <RouteTransition>
      <Entry />
    </RouteTransition>
  );
}
