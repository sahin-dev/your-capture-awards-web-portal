'use client';

import Reveal from '@/components/Reveal';
import { useGetSocialLinksQuery, type SocialPlatform } from '@/store/apis/socialLinkApi';
import Link from 'next/link';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { HiOutlineGlobeAlt } from 'react-icons/hi';
import { MdOutlineMail, MdOutlineSchedule } from 'react-icons/md';
import LogoName from '../LogoName';

const socialIcon: Record<SocialPlatform, React.ReactNode> = {
  FACEBOOK: <FaFacebook className="size-4" />,
  INSTAGRAM: <FaInstagram className="size-4" />,
  X: <FaXTwitter className="size-4" />,
  YOUTUBE: <FaYoutube className="size-4" />,
  TIKTOK: <FaTiktok className="size-4" />,
  LINKEDIN: <FaLinkedin className="size-4" />,
  PINTEREST: <FaPinterest className="size-4" />,
  WHATSAPP: <FaWhatsapp className="size-4" />,
  EMAIL: <MdOutlineMail className="size-4" />,
  WEBSITE: <HiOutlineGlobeAlt className="size-4" />,
};

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/discover', label: 'Discover' },
  { href: '/contest/open', label: 'Contests' },
  { href: '/support', label: 'Support' },
];

const legalLinks = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="group text-muted-foreground hover:text-primary inline-flex w-fit items-center gap-2 text-sm transition-colors duration-300"
  >
    <span className="bg-primary h-px w-0 transition-all duration-300 group-hover:w-4" />
    {label}
  </Link>
);

const Footer = () => {
  const { data } = useGetSocialLinksQuery();
  const socialLinks = data?.data ?? [];

  return (
    <footer className="border-border-subtle relative mt-24 overflow-hidden border-t">
      {/* Brand bloom anchored to the bottom edge */}
      <div
        className="bg-primary/8 pointer-events-none absolute -bottom-48 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative container py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <Reveal>
            <LogoName className="w-40" />
            <p className="text-muted-foreground mt-5 max-w-xs text-sm leading-relaxed text-pretty">
              A home for photographers who want their work judged on craft — contests, critique and
              recognition from a global community.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    target={link.platform === 'EMAIL' ? undefined : '_blank'}
                    rel={link.platform === 'EMAIL' ? undefined : 'noopener noreferrer'}
                    aria-label={link.platform}
                    className="border-border-subtle text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground flex size-10 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-1"
                  >
                    {socialIcon[link.platform]}
                  </Link>
                ))
              ) : (
                <Link
                  href="mailto:info@yourcaptureawards.org"
                  aria-label="Email us"
                  className="border-border-subtle text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground flex size-10 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-1"
                >
                  <MdOutlineMail className="size-4" />
                </Link>
              )}
            </div>
          </Reveal>

          {/* Explore */}
          <Reveal delay={90}>
            <h4 className="eyebrow">Explore</h4>
            <nav className="mt-5 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </nav>
          </Reveal>

          {/* Legal */}
          <Reveal delay={180}>
            <h4 className="eyebrow">Legal</h4>
            <nav className="mt-5 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </nav>
          </Reveal>

          {/* Contact */}
          <Reveal delay={270}>
            <h4 className="eyebrow">Get in touch</h4>

            <div className="mt-5 space-y-5">
              <div className="group flex items-start gap-3">
                <span className="border-border-subtle text-primary bg-surface-secondary group-hover:border-primary flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300">
                  <MdOutlineMail className="size-4" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-medium">Email us</p>
                  <a
                    href="mailto:info@yourcaptureawards.org"
                    className="text-muted-foreground hover:text-primary text-sm break-all transition-colors"
                  >
                    info@yourcaptureawards.org
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-3">
                <span className="border-border-subtle text-primary bg-surface-secondary group-hover:border-primary flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300">
                  <MdOutlineSchedule className="size-4" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-medium">Opening hours</p>
                  <p className="text-muted-foreground text-sm">Mon–Sun, 9:00 AM – 9:00 PM</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Baseline */}
        <div className="border-border-subtle mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-caption-foreground text-xs">
            © {new Date().getFullYear()} Your Capture Awards. All rights reserved.
          </p>
          <p className="text-caption-foreground text-xs tracking-[0.18em] uppercase">
            Made for photographers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
