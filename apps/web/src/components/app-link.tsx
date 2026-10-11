"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Motion = "forward" | "back" | "fade";

const types: Record<Motion, string[]> = {
  forward: ["nav-forward"],
  back: ["nav-back"],
  fade: ["nav-fade"],
};

export function AppLink({
  motion = "fade",
  ...props
}: ComponentProps<typeof Link> & { motion?: Motion }) {
  return <Link {...props} transitionTypes={types[motion]} />;
}
