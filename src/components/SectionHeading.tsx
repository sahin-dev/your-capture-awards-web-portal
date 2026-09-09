import { cn } from '@/utils/cn';
import Reveal from './Reveal';

type SectionHeadingProps = {
  /** Small tracked label above the title. */
  eyebrow?: string;
  title: React.ReactNode;
  /** Supporting sentence below the title. */
  lead?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
};

/**
 * The one headline treatment used across every marketing section, so the
 * eyebrow / rule / title / lead rhythm stays identical page to page.
 */
const SectionHeading = ({
  eyebrow,
  title,
  lead,
  align = 'center',
  className,
}: SectionHeadingProps) => {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        centered ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <Reveal direction="fade" className="flex items-center gap-3">
          <span className="bg-primary/60 h-px w-8" />
          <span className="eyebrow">{eyebrow}</span>
          <span className="bg-primary/60 h-px w-8" />
        </Reveal>
      )}

      <Reveal delay={80}>
        <h2
          className={cn(
            'font-editorial text-heading text-3xl leading-[1.15] font-medium text-balance sm:text-4xl lg:text-5xl',
            centered ? 'mx-auto max-w-3xl' : 'max-w-2xl',
          )}
        >
          {title}
        </h2>
      </Reveal>

      {lead && (
        <Reveal delay={160}>
          <p
            className={cn(
              'text-muted-foreground text-base leading-relaxed text-pretty sm:text-lg',
              centered ? 'mx-auto max-w-2xl' : 'max-w-xl',
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
};

export default SectionHeading;
