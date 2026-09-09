'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import TeamMembershipLoading from '@/components/module/team/TeamMembershipLoading';
import { COUNTRIES, LANGUAGES } from '@/constants/team';
import { useAuth } from '@/hooks/useAuth';
import { useTeamMembership } from '@/hooks/useTeamMembership';
import { useGetAllLevelsQuery, useGetUserProgressQuery } from '@/store/apis/levelsApi';
import { useCreateTeamMutation } from '@/store/apis/teamApi';
import { useGetStoreStatsQuery } from '@/store/apis/storeApi';
import { useStoreModal } from '@/providers/StoreModalProvider';
import { showErrorToast } from '@/utils/team-feedback';

const TEAM_COIN_COST = 500;

const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name should be at least 3 characters').max(50, 'Too long'),
  level: z.string().min(1, 'Select a team level'),
  min_requirement: z.string().min(1, 'Select a minimum requirement'),
  language: z.string().min(1, 'Select a language'),
  country: z.string().min(1, 'Select a country'),
  description: z.string().min(20, 'Add a stronger description').max(300, 'Max 300 characters'),
  accessibility: z.enum(['PUBLIC', 'PRIVATE']),
});

type CreateTeamValues = z.infer<typeof createTeamSchema>;

const defaultValues: CreateTeamValues = {
  name: '',
  level: '',
  min_requirement: '',
  language: 'English',
  country: 'United States',
  description: '',
  accessibility: 'PUBLIC',
};

function CreateTeamSkeleton() {
  return (
    <main className="margin container py-8 lg:py-10">
      <div className="space-y-5">
        <div className="bg-surface-secondary h-4 w-32 rounded" />
        <div className="space-y-2">
          <div className="bg-surface-secondary h-8 w-48 rounded" />
          <div className="bg-surface-secondary h-4 w-full max-w-2xl rounded" />
          <div className="bg-surface-secondary h-4 w-4/5 max-w-xl rounded" />
        </div>
        <div className="space-y-4 rounded-xl border p-5">
          <div className="bg-surface-secondary h-24 rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-surface-secondary h-16 rounded" />
            <div className="bg-surface-secondary h-16 rounded" />
          </div>
          <div className="bg-surface-secondary h-16 rounded" />
          <div className="bg-surface-secondary h-32 rounded" />
          <div className="flex justify-end gap-3">
            <div className="bg-surface-secondary h-10 w-24 rounded" />
            <div className="bg-surface-secondary h-10 w-28 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}

function TeamCreatePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { openStore } = useStoreModal();
  const fileRef = useRef<HTMLInputElement>(null);
  const [badgePreview, setBadgePreview] = useState<string | null>(null);
  const [badgeFileName, setBadgeFileName] = useState('No badge selected');
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();

  const form = useForm<CreateTeamValues, any, CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues,
  });

  const { isCheckingMembership, hasTeam } = useTeamMembership();

  const { data: levelsData, isLoading: isLevelsLoading } = useGetAllLevelsQuery(
    { page: 1, limit: 50 },
    { skip: !token },
  );

  const { data: progressData, isLoading: isProgressLoading } = useGetUserProgressQuery(undefined, {
    skip: !token,
  });
  const { data: storeStatsData, isLoading: isStoreStatsLoading } = useGetStoreStatsQuery(
    undefined,
    {
      skip: !token,
    },
  );

  const userProgress = progressData?.data ?? null;
  const teamLevels = levelsData?.data ?? [];
  const storeStats = storeStatsData?.data ?? null;
  // const currentLevelOrder = userProgress?.currentStatus?.order ?? 1;
  const currentLevelName = userProgress?.currentStatus?.name ?? 'APPRENTICE';
  // const isLevelTooLow = currentLevelOrder < 3;

  useEffect(() => {
    if (isCheckingMembership) return;
    if (hasTeam) {
      router.replace('/teams/home');
    }
  }, [hasTeam, isCheckingMembership, router]);

  useEffect(() => {
    if (!teamLevels.length) return;

    const firstLevel = teamLevels[0];
    form.reset({
      ...defaultValues,
      level: firstLevel?.levelName ?? '',
      min_requirement: firstLevel?.levelName ?? '',
    });
  }, [form, teamLevels]);

  if (
    isCheckingMembership ||
    hasTeam ||
    isProgressLoading ||
    isLevelsLoading ||
    isStoreStatsLoading
  ) {
    return <CreateTeamSkeleton />;
  }

  // if (isLevelTooLow) {
  //   return (
  //     <main className="margin container py-8 lg:py-10">
  //       <div className="mx-auto max-w-xl space-y-5 py-12 text-center">
  //         <div className="bg-primary/10 border-primary/20 text-primary mx-auto flex size-16 items-center justify-center rounded-full border">
  //           <Trophy className="size-8" />
  //         </div>
  //         <h1 className="font-kumbh text-foreground text-2xl font-bold">Team Creation Locked</h1>
  //         <p className="text-muted-foreground text-sm leading-6">
  //           You must reach at least <strong className="text-foreground">Level 3 (TRAINED)</strong>{' '}
  //           to build your own team. Your current level is{' '}
  //           <strong className="text-foreground">
  //             Level {currentLevelOrder} ({currentLevelName})
  //           </strong>
  //           .
  //         </p>
  //         <div className="pt-4">
  //           <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
  //             <Link href="/teams">Back to Teams</Link>
  //           </Button>
  //         </div>
  //       </div>
  //     </main>
  //   );
  // }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(onSubmit, (errors) => {
      const firstError = Object.values(errors)[0];
      toast.error(firstError?.message || 'Please complete the form before creating a team.');
    })(event);
  };

  const handleBadgeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for the team badge.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Badge image must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    setBadgeFile(file);
    setBadgeFileName(file.name);

    const reader = new FileReader();
    reader.onload = (loadEvent) => setBadgePreview(loadEvent.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearBadge = () => {
    setBadgePreview(null);
    setBadgeFileName('No badge selected');
    setBadgeFile(null);

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const onSubmit = async (values: CreateTeamValues) => {
    try {
      const availableCoins = storeStats?.coins ?? 0;
      if (availableCoins < TEAM_COIN_COST) {
        toast.error(`You need ${TEAM_COIN_COST} coins to create a team.`);
        openStore();
        return;
      }

      if (!token) {
        toast.error('Please sign in first.');
        return;
      }

      const payload = new FormData();

      payload.append('name', values.name);
      payload.append('level', values.level);
      payload.append('language', values.language);
      payload.append('country', values.country);
      payload.append('description', values.description);
      payload.append('accessibility', values.accessibility);
      payload.append('min_requirement', values.min_requirement);

      if (badgeFile) {
        payload.append('badge', badgeFile);
      }

      await createTeam(payload).unwrap();
      toast.success('Team created successfully.');
      form.reset(defaultValues);
      clearBadge();
      router.replace('/teams/home');
    } catch (error) {
      showErrorToast(error, 'Failed to create team');
    }
  };

  return (
    <main className="margin container py-8 lg:py-10">
      <div className="space-y-5">
        <Link href="/teams" className="text-primary hover:text-primary text-sm font-medium">
          &lt; View Teams List
        </Link>

        <div className="space-y-2">
          <h1 className="font-kumbh text-foreground text-2xl font-bold sm:text-3xl">
            Build Your Team
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-6">
            Set up your team name, visibility, language, country, and entry level in a clean dark
            form.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={onFormSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                  <Upload className="size-4" />
                </span>
                <div>
                  <h2 className="text-foreground font-semibold">Team badge</h2>
                  <p className="text-muted-foreground text-sm">PNG, JPG, or WebP up to 5 MB.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="border-border bg-surface-secondary relative size-24 shrink-0 overflow-hidden rounded-2xl border">
                  {badgePreview ? (
                    <Image
                      src={badgePreview}
                      alt="Team badge preview"
                      fill
                      unoptimized={
                        badgePreview.startsWith('blob:') || badgePreview.startsWith('data:')
                      }
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(252,102,0,0.2),transparent_70%)]">
                      <Upload className="text-primary size-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Team badge upload"
                    title="Team badge upload"
                    className="hidden"
                    onChange={handleBadgeChange}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-border bg-surface-secondary"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="size-4" />
                      {badgePreview ? 'Change badge' : 'Upload badge'}
                    </Button>

                    {badgePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={clearBadge}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <p className="text-muted-foreground text-xs">Selected file: {badgeFileName}</p>
                </div>
              </div>
            </div>

            <div className="grid items-start gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase">
                      Team name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-border bg-surface-secondary/90"
                        placeholder="Test Team"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_requirement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase">
                      Minimum requirement
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-border bg-surface-secondary/90 w-full!">
                          <SelectValue placeholder="Select minimum requirement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamLevels.map((requirement) => (
                          <SelectItem key={requirement.id} value={requirement.levelName}>
                            {requirement.levelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid items-start gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase">
                      Language
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-border bg-surface-secondary/90 w-full!">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs uppercase">
                      Country
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-border bg-surface-secondary/90 w-full!">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accessibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase">
                    Accessibility
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-border bg-surface-secondary/90 w-full!">
                        <SelectValue placeholder="Choose visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs uppercase">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border-border bg-surface-secondary/90 min-h-32 resize-none"
                      placeholder="A team of skilled players"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 sm:justify-end">
              <Button asChild variant="outline" className="border-border bg-surface-secondary/80">
                <Link href="/teams">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isCreating}
              >
                {isCreating
                  ? `Creating... (${TEAM_COIN_COST} coins)`
                  : `Create team (${TEAM_COIN_COST} coins)`}
              </Button>
            </div>
            <p className="text-muted-foreground text-right text-xs">
              You need {TEAM_COIN_COST} coins to create a team. If you do not have enough coins, the
              store can be opened to top up.
            </p>
          </form>
        </Form>
      </div>
    </main>
  );
}

export default TeamCreatePage;
