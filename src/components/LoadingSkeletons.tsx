/**
 * Loading skeleton components for better perceived performance
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Generic skeleton component for loading states
 */
export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />;
}

/**
 * Skeleton for NFT/Prompt cards
 */
export function PromptCardSkeleton() {
  return (
    <Card className="glass overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of prompt card skeletons
 */
export function PromptCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for profile header
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="glass mb-8 rounded-lg p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <Skeleton className="h-24 w-24 flex-shrink-0 rounded-full" />
        <div className="flex-grow space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-6 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 md:self-start" />
      </div>
    </div>
  );
}

/**
 * Skeleton for transaction table rows
 */
export function TransactionRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
    </tr>
  );
}

/**
 * Skeleton for transaction table
 */
export function TransactionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="glass">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium">Event</th>
                <th className="px-4 py-3 text-left font-medium">Prompt</th>
                <th className="px-4 py-3 text-left font-medium">From/To</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <TransactionRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for hero stats section
 */
export function HeroStatsSkeleton() {
  return (
    <div className="glass mt-16 grid grid-cols-2 gap-4 rounded-xl p-6 md:mt-24 md:grid-cols-4 md:gap-8 md:p-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-2">
          <Skeleton className="mb-2 h-7 w-7 rounded-full" />
          <Skeleton className="mb-1 h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

/**
 * Full page loading skeleton
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 pb-16 pt-24">
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-pulse-glow rounded-full bg-purple-600/30"></div>
        </div>
      </main>
    </div>
  );
}

/**
 * Inline loading spinner
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]} ${className}`}
    />
  );
}
