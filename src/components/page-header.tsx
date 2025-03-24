"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  description,
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("pb-4", className)} {...props}>
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {heading}
          </h1>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children && <div className="mt-2 md:mt-0">{children}</div>}
      </div>
    </div>
  );
}

interface PageHeaderSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  hasAction?: boolean;
}

export function PageHeaderSkeleton({
  hasAction = false,
  className,
  ...props
}: PageHeaderSkeletonProps) {
  return (
    <div className={cn("pb-4", className)} {...props}>
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="grid gap-1">
          <Skeleton className="h-8 w-40 md:h-9 md:w-48" />
          <Skeleton className="h-4 w-52 md:w-64" />
        </div>
        {hasAction && (
          <div className="mt-2 md:mt-0">
            <Skeleton className="h-9 w-24" />
          </div>
        )}
      </div>
    </div>
  );
}
