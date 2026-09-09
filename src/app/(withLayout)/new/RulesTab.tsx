import { IconPlaceholder } from './IconPlaceholder';

const RULES = [
  {
    icon: 'hash',
    title: 'Submission limit',
    description: '4 photo submits per participant',
  },
  {
    icon: 'photo-x',
    title: 'Submission rules',
    description:
      "Do not post: non-relevant images, similar images (same subject, background, foreground and location), the same image edited multiple times, or AI images. Images that don't comply may be removed.",
  },
  {
    icon: 'trophy',
    title: 'Level requirements',
    description: 'Popular 50, Skilled 200, Premier 750, Elite 2,000, All star 3,200 votes.',
  },
  {
    icon: 'photo-plus',
    title: 'Submission format',
    description: 'JPEG, minimum resolution of 700px x 700px, maximum size 25MB.',
  },
  {
    icon: 'file-check',
    title: 'Eligibility',
    description:
      'Open to all photographers ages 18 and above. Photos must not contain obscene, provocative, defamatory, sexually explicit, or otherwise objectionable content.',
  },
];

export function RulesTab() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {RULES.map((rule) => (
        <div key={rule.title} className="border-border bg-surface flex gap-5 rounded-lg border p-8">
          <div className="border-border flex size-14 shrink-0 items-center justify-center rounded-lg border">
            <IconPlaceholder name={rule.icon} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-medium">{rule.title}</p>
            <p className="text-muted-foreground leading-relaxed">{rule.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
