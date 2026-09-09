'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitSupportTicketMutation } from '@/store/apis/supportApi';
import {
  Bug,
  CheckCircle2,
  Clock,
  CreditCard,
  LifeBuoy,
  Loader2,
  LogIn,
  Mail,
  Send,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const SUPPORT_EMAIL = 'info@yourcaptureawards.org';

const HELP_TOPICS = [
  {
    label: 'Account & login',
    subject: 'Account & login issues',
    description: 'Sign in, profile access, verification, or password trouble.',
    icon: LogIn,
  },
  {
    label: 'Billing',
    subject: 'Payments & billing',
    description: 'Coins, entry fees, payment status, or charge questions.',
    icon: CreditCard,
  },
  {
    label: 'Technical issue',
    subject: 'Bugs & technical problems',
    description: 'Uploads, voting, page errors, or performance problems.',
    icon: Bug,
  },
  {
    label: 'Teams & contests',
    subject: 'Team & tournament questions',
    description: 'Team setup, matches, rankings, and contest participation.',
    icon: UsersRound,
  },
];

const responseNotes = [
  'Use the email connected to your account.',
  'Mention contest, team, payment, or upload IDs when possible.',
  'Include screenshots or exact error text for technical issues.',
];

export default function SupportPage() {
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [submitSupportTicket] = useSubmitSupportTicketMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const message = String(formData.get('message') || '');

    try {
      const response = await submitSupportTicket({
        name,
        email,
        subject,
        message,
      }).unwrap();

      toast.success(response.message || 'Support ticket submitted successfully');
      form.reset();
      setSubject('');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Unable to submit support request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="margin overflow-hidden">
      <section className="border-border relative border-b">
        <Image
          src="/images/hero.jpg"
          alt="Your Capture Awards support desk"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-28"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_88%,transparent)_48%,color-mix(in_oklab,var(--background)_64%,transparent)_100%)]" />

        <div className="relative container grid gap-10 py-14 lg:min-h-[680px] lg:grid-cols-[0.72fr_0.88fr] lg:items-center lg:py-16">
          <div className="max-w-2xl">
            <div className="text-primary mb-6 inline-flex items-center gap-3 text-sm font-semibold">
              <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
                <LifeBuoy className="size-5" />
              </span>
              Support Center
            </div>
            <h1 className="text-heading text-5xl leading-[1.03] font-semibold sm:text-6xl">
              Tell us what happened. We will help you get unstuck.
            </h1>
            <p className="text-body mt-6 max-w-xl text-base leading-7 sm:text-lg">
              Account access, payments, uploads, contest questions, and technical issues all start
              here. Send the details and our team will follow up with a clear next step.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="group border-primary bg-background/55 hover:bg-surface/80 border-l-2 p-4 transition"
              >
                <Mail className="text-primary size-5" />
                <p className="text-heading mt-3 font-semibold">Email support</p>
                <p className="text-muted-foreground group-hover:text-foreground mt-1 text-sm break-words">
                  {SUPPORT_EMAIL}
                </p>
              </a>
              <div className="border-primary bg-background/55 border-l-2 p-4">
                <Clock className="text-primary size-5" />
                <p className="text-heading mt-3 font-semibold">Response window</p>
                <p className="text-muted-foreground mt-1 text-sm">1 to 2 business days</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-border bg-surface/95 shadow-overlay rounded-lg border p-5 backdrop-blur sm:p-7 lg:p-8"
          >
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                Submit a request
              </p>
              <h2 className="text-heading text-2xl font-semibold">How can we help?</h2>
              <p className="text-muted-foreground text-sm leading-6">
                Select a topic or write a custom subject, then describe the issue.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Your full name"
                  className="border-border bg-background h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="border-border bg-background h-11"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <label className="text-foreground text-sm font-medium" htmlFor="subject">
                Topic
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {HELP_TOPICS.map(({ label, subject: topicSubject, icon: Icon }) => {
                  const selected = subject === topicSubject;

                  return (
                    <button
                      key={topicSubject}
                      type="button"
                      onClick={() => setSubject(topicSubject)}
                      data-selected={selected}
                      className="border-border bg-background hover:border-primary/60 hover:bg-primary/5 data-[selected=true]:border-primary data-[selected=true]:bg-primary/10 flex min-h-12 items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition"
                    >
                      <Icon className="text-primary size-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
              <Input
                id="subject"
                name="subject"
                required
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Or type a custom subject"
                className="border-border bg-background h-11"
              />
            </div>

            <div className="mt-5 space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="message">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="Tell us what happened, what you expected, and any steps we can use to reproduce it."
                className="border-border bg-background min-h-44 resize-none sm:min-h-52"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-center text-xs leading-5 sm:max-w-sm sm:text-left">
                By submitting, you agree to be contacted at the email above.
              </p>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 shrink-0 gap-2 px-5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="container grid gap-10 py-16 lg:grid-cols-[0.7fr_1fr] lg:py-24">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Faster Resolutions
          </p>
          <h2 className="text-heading mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
            The details that help us solve your request sooner.
          </h2>
          <p className="text-body mt-5 text-base leading-7">
            We keep account safety and contest fairness in mind when reviewing support requests. A
            little context upfront helps us avoid follow-up delays.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {responseNotes.map((note) => (
            <div key={note} className="border-border border-t pt-5">
              <CheckCircle2 className="text-primary size-5" />
              <p className="text-muted-foreground mt-4 text-sm leading-6">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border bg-surface-secondary/35 border-t">
        <div className="container py-16 lg:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                Common Topics
              </p>
              <h2 className="text-heading mt-3 text-3xl font-semibold">What we can help with</h2>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              Pick any topic below to prefill the form subject, then add the details that are
              specific to your situation.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HELP_TOPICS.map(({ label, subject: topicSubject, description, icon: Icon }) => (
              <button
                key={topicSubject}
                type="button"
                onClick={() => setSubject(topicSubject)}
                className="group border-border bg-background hover:border-primary/60 hover:bg-surface rounded-lg border p-5 text-left transition"
              >
                <Icon className="text-primary size-5" />
                <h3 className="text-heading mt-5 font-semibold">{label}</h3>
                <p className="text-muted-foreground group-hover:text-body mt-2 text-sm leading-6">
                  {description}
                </p>
              </button>
            ))}
          </div>

          <div className="border-border mt-10 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                For account or payment requests, we may ask for additional verification before
                making changes.
              </p>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="border-border-strong text-foreground hover:bg-surface inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition"
            >
              Email us directly: {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
