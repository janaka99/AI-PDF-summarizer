import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={twMerge("container mx-auto px-4 md:px-6", className)}>
      {children}
    </div>
  );
}
