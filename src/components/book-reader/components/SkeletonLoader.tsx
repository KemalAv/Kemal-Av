import React from 'react';
import { Loader2, FileText } from 'lucide-react';

interface SkeletonLoaderProps {
  message?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  message = 'Sedang memproses dan mengonversi dokumen...',
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-10">
      {/* Loading banner */}
      <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <Loader2 className="w-5 h-5 text-slate-700 animate-spin" />
        <span className="text-sm font-medium text-slate-700">{message}</span>
      </div>

      {/* Simulated Document Sheet Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 sm:p-12 space-y-6">
        {/* Title skeleton */}
        <div className="h-8 bg-slate-200 rounded-md w-3/4 animate-pulse mb-8" />

        {/* Paragraph 1 */}
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-11/12 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-4/5 animate-pulse" />
        </div>

        {/* Paragraph 2 */}
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-10/12 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
        </div>

        {/* Blockquote Skeleton */}
        <div className="border-l-4 border-slate-300 pl-4 py-2 space-y-2.5">
          <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
        </div>

        {/* Paragraph 3 */}
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-9/12 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
