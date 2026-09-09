'use client';

import TipTapViewer from '@/components/custom/tiptap-editor/TipTapViewer';
import { Spinner } from '@/components/ui/spinner';
import { useGetSitePolicyQuery } from '@/store/apis/sitePolicyApi';

export default function TermsPage() {
  const { data, isLoading, error } = useGetSitePolicyQuery({ type: 'TERMS' });
  const policy = data?.data?.[0];

  return (
    <section className="margin container py-6">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-semibold">Terms & Conditions</h1>
          {policy?.updatedAt && (
            <p className="text-muted-foreground text-sm">
              Last updated on {new Date(policy.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <hr className="my-6" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Spinner className="text-primary size-8" />
            <p className="text-muted-foreground text-sm">Loading terms...</p>
          </div>
        ) : error ? (
          <div className="text-destructive py-10 text-center">
            Failed to load content. Please try again later.
          </div>
        ) : !policy?.content ? (
          <div className="text-foreground/50 py-10 text-center">No content available.</div>
        ) : (
          <TipTapViewer content={policy.content} className="text-foreground" />
        )}
      </div>
    </section>
  );
}
