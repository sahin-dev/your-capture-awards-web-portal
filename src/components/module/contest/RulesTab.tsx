'use client';

import { TabsContent } from '@/components/ui/tabs';
import {
  BadgeCheck,
  Copyright,
  FileCheck,
  Hash,
  ImagePlus,
  ImageUp,
  LucideIcon,
  Trophy,
  UserRound,
  Vote,
} from 'lucide-react';

const RULE_ICONS: Record<string, LucideIcon> = {
  'number-circle': Hash,
  'image-upload': ImageUp,
  'level-stars': Trophy,
  'image-plus': ImagePlus,
  'file-check': FileCheck,
  copyright: Copyright,
  vote: Vote,
  user: UserRound,
};

const RulesTab = ({ contest, value }: { contest: any; value: string }) => {
  return (
    <TabsContent value={value} className="mx-auto w-full max-w-5xl space-y-5">
      {(contest?.rules ?? [])
        .filter((rule: any) => rule?.enabled !== false)
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
        .map((rule: any) => {
          const Icon = RULE_ICONS[rule?.icon] ?? BadgeCheck;
          return (
            <article
              key={rule?.key ?? rule?.id ?? rule?.name}
              className="border-border bg-surface flex gap-4 rounded-lg border p-5 sm:gap-5 sm:p-8"
            >
              <div className="border-border bg-surface-secondary flex size-12 shrink-0 items-center justify-center rounded-lg border sm:size-14">
                <Icon className="text-primary size-5 sm:size-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-lg font-medium sm:text-xl">{rule?.label ?? rule?.name}</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {rule?.description ?? 'No details available.'}
                </p>
              </div>
            </article>
          );
        })}
      {!contest?.rules?.length && (
        <p className="text-muted-foreground py-12 text-center">
          No contest rules have been added yet.
        </p>
      )}
    </TabsContent>
  );
};

export default RulesTab;
