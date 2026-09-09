'use client';

import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { discoverItems } from '@/constants';
import Image from 'next/image';

const Discover = () => {
  return (
    <section id="discover" className="relative overflow-hidden py-24 lg:py-32">
      {/* Backdrop photograph, pushed well back so the cards stay legible */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Image alt="" src="/images/backdrop.jpg" fill className="object-cover opacity-30" />
        <div className="from-background via-background/85 to-background absolute inset-0 bg-gradient-to-b" />
      </div>

      <div className="container">
        <SectionHeading
          eyebrow="Discover"
          title={
            <>
              Discover incredible insights,{' '}
              <span className="text-gradient-brand">strengthen skills</span>
            </>
          }
          lead="Explore insights, bolster skills. Elevate your expertise with newfound knowledge and refined abilities."
        />

        {/* Four pillars. Hovering lifts the card and blooms the icon rather
            than resizing it, so nothing in the grid shifts underneath. */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {discoverItems?.map((item, index) => (
            <Reveal key={item.key} delay={index * 110}>
              <article className="group border-border-subtle bg-surface/60 hover:border-primary/40 relative h-full overflow-hidden rounded-2xl border p-8 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                {/* Bloom that fades in behind the icon on hover */}
                <div className="bg-primary/20 pointer-events-none absolute -top-16 left-1/2 size-40 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative mx-auto flex size-24 items-center justify-center">
                  <span className="border-primary/30 group-hover:border-primary/70 absolute inset-0 rounded-full border transition-all duration-500 group-hover:scale-110" />
                  {/* Opaque brand disc — the icon artwork is near-black and
                      needs a solid light ground to stay legible. */}
                  <span className="from-brand-400 to-brand-600 group-hover:from-brand-300 group-hover:to-brand-500 absolute inset-2 rounded-full bg-gradient-to-br transition-colors duration-500" />
                  <Image
                    src={item.img}
                    alt=""
                    width={48}
                    height={48}
                    className="relative h-12 w-auto transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <h3 className="text-heading relative mt-6 text-lg font-semibold tracking-[0.12em] uppercase">
                  {item.label}
                </h3>

                {/* Rule that draws itself out from the centre on hover */}
                <span className="bg-primary relative mx-auto mt-3 block h-px w-8 transition-all duration-500 group-hover:w-16" />

                {item.sub && (
                  <p className="text-muted-foreground relative mt-4 text-sm leading-relaxed">
                    {item.sub}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Discover;
