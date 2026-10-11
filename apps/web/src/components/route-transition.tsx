import { ViewTransition } from "react";

const motion = {
  "nav-forward": "ios-forward",
  "nav-back": "ios-back",
  "nav-fade": "netflix-fade",
  default: "netflix-fade",
} as const;

export function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={motion} exit={motion} default="none">
      {children}
    </ViewTransition>
  );
}
