'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoErrorProps {
  message?: string;
  onRetry: () => void;
  backUrl?: string;
}

export function PhotoError({
  message = 'Failed to load photo details. Please verify your connection.',
  onRetry,
  backUrl = '/',
}: PhotoErrorProps) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div className="border-border bg-surface flex w-full max-w-md flex-col items-center rounded-2xl border p-8 shadow-2xl">
        <div className="bg-destructive/10 text-destructive ring-destructive/5 mb-6 grid size-16 place-items-center rounded-full ring-8">
          <AlertCircle className="size-8" />
        </div>

        <h2 className="text-foreground mb-2 text-xl font-black tracking-wider uppercase">
          Unable to Load Content
        </h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed font-medium">{message}</p>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button
            onClick={onRetry}
            className="bg-info text-info-foreground hover:bg-info/90 flex h-11 flex-1 items-center justify-center gap-2 font-bold transition-all duration-200"
          >
            <RotateCw className="animate-spin-hover size-4" />
            Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-border text-muted-foreground hover:border-border-strong hover:text-foreground flex h-11 flex-1 items-center justify-center gap-2 bg-transparent font-bold"
          >
            <Link href={backUrl}>
              <ArrowLeft className="size-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
