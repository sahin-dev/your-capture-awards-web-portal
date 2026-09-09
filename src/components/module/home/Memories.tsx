'use client';

import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { memoriesImages } from '@/constants';
import Image from 'next/image';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export default function Memories() {
  return (
    <section id="memories" className="relative overflow-hidden py-24 lg:py-32">
      {/* Faint concentric backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055]"
        aria-hidden="true"
      >
        <Image alt="" src="/images/back-circle.png" fill className="object-contain object-center" />
      </div>

      <div className="container">
        <SectionHeading
          eyebrow="Memories"
          title={
            <>
              Guardian of cherished memories{' '}
              <span className="text-gradient-brand">through time</span>
            </>
          }
          lead="Presenting nearly 30,000 diverse captures, spanning natural, cultural, and everything-in-between imagery in our collection."
        />
      </div>

      {/* Coverflow gallery — deliberately breaks the container so the deck
          bleeds to both edges the way a print portfolio spread would. */}
      <Reveal direction="scale" delay={120} className="mt-16">
        <Swiper
          modules={[Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor
          centeredSlides
          loop
          speed={900}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 160,
            modifier: 2,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3200, disableOnInteraction: false }}
          spaceBetween={24}
          slidesPerView={1.15}
          breakpoints={{
            640: { slidesPerView: 1.6 },
            1024: { slidesPerView: 2.4 },
            1536: { slidesPerView: 3.2 },
          }}
          className="!px-4 !pb-16 sm:!px-6 lg:!px-8"
        >
          {memoriesImages?.map((src, i) => (
            <SwiperSlide key={i} className="!h-auto">
              <figure className="media-zoom group ring-border-subtle relative aspect-[4/3] overflow-hidden rounded-2xl ring-1">
                <Image
                  src={src.image}
                  alt={`Capture ${i + 1} from the collection`}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />

                {/* Caption scrim, lifts in on hover */}
                <div className="from-background/95 absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="eyebrow">Collection</p>
                  <p className="font-editorial text-heading mt-1 text-xl font-medium">
                    Capture No. {String(i + 1).padStart(2, '0')}
                  </p>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>
    </section>
  );
}
