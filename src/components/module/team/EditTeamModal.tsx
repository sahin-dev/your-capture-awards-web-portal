import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { COUNTRIES, LANGUAGES, SKILL_LEVELS } from '@/constants/team';
import { useGetAllLevelsQuery } from '@/store/apis/levelsApi';
import { editTeamSchema, EditTeamValues } from '@/lib/schemas/teamSchema';
import { TeamData } from '@/types/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

interface EditTeamModalProps {
  open: boolean;
  onClose: () => void;
  team: TeamData;
  onSave: (
    values: EditTeamValues & { badgeFile?: File | null; badgePreview?: string | null },
  ) => void;
}

function EditTeamModal({ open, onClose, team, onSave }: EditTeamModalProps) {
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string | null>(team.badge);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: levelsData, isLoading: isLevelsLoading } = useGetAllLevelsQuery({
    page: 1,
    limit: 50,
  });
  const levelOptions = levelsData?.data ?? [];
  const defaultRequirement =
    team.min_requirement ?? team.skill_level ?? levelOptions[0]?.levelName ?? '';

  const form = useForm<z.input<typeof editTeamSchema>, any, z.output<typeof editTeamSchema>>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: team.name,
      description: team.description,
      language: team.language,
      country: team.country,
      min_requirement: defaultRequirement,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: team.name,
      description: team.description,
      language: team.language,
      country: team.country,
      min_requirement: team.min_requirement ?? team.skill_level ?? levelOptions[0]?.levelName ?? '',
    });
    setBadgePreview(team.badge);
    setBadgeFile(null);
  }, [form, open, team, levelOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }
    setBadgeFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setBadgePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: EditTeamValues) => {
    onSave({ ...values, badgeFile, badgePreview });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ── Badge upload with preview ── */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Team Badge
              </p>
              <div className="flex items-center gap-4">
                {/* Preview box */}
                <div className="border-border bg-surface-secondary flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                  {badgePreview ? (
                    <Image
                      src={badgePreview}
                      alt="badge preview"
                      width={64}
                      height={64}
                      unoptimized={
                        badgePreview.startsWith('blob:') || badgePreview.startsWith('data:')
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload size={20} className="text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <Input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={13} className="mr-1.5" />
                      {badgePreview ? 'Change image' : 'Upload image'}
                    </Button>

                    {badgePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setBadgePreview(null);
                          setBadgeFile(null);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">PNG, JPG or WebP · max 5 MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs tracking-wider uppercase">
                    Team Name
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs tracking-wider uppercase">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-20 resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language + Country dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs tracking-wider uppercase">
                      Language
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full!">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
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
                    <FormLabel className="text-muted-foreground text-xs tracking-wider uppercase">
                      Country
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full!">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
              name="min_requirement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs tracking-wider uppercase">
                    Min Requirement
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full!">
                        <SelectValue placeholder="Select minimum requirement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {levelOptions.map((level) => (
                        <SelectItem key={level.id} value={level.levelName}>
                          {level.levelName}
                        </SelectItem>
                      ))}
                      {isLevelsLoading ? (
                        <SelectItem value={field.value} disabled>
                          Loading levels...
                        </SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditTeamModal;
