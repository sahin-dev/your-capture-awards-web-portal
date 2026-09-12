'use client';

import FormField from '@/components/FormField';
import LogoName from '@/components/LogoName';
import {
  SigninFormData,
  signinSchema,
  SignupFormData,
  signupSchema,
} from '@/lib/schemas/authSchema';
import { useSigninMutation, useSignupMutation } from '@/store/apis/authApi';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaGoogle } from 'react-icons/fa';
import { IoCheckboxOutline } from 'react-icons/io5';
import { toast } from 'sonner';

const AuthForm = ({ type = 'signin' }: { type: 'signin' | 'signup' }) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/contest/joined';

  const [signin, { isLoading: isSigninLoading }] = useSigninMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  const signinForm = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const agreeValue = useWatch({
    control: signupForm.control,
    name: 'agree',
  });

  const signInSubmit = async (data: SigninFormData) => {
    try {
      const result = await signin({
        email: data?.email,
        password: data?.password,
        remember_me: rememberMe,
      }).unwrap();

      toast.success('Login Successful', {
        description: `Welcome back, ${result.data.user.firstName}!`,
      });

      signinForm.reset();
      // Slight delay to show toast
      setTimeout(() => router.push(returnTo), 800);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || 'Please check your credentials and try again.';

      toast.error('Login Failed', {
        description: errorMessage,
      });
    }
  };

  const signUpSubmit = async (data: SignupFormData) => {
    try {
      const result = await signup({
        email: data?.email,
        firstName: data?.firstName,
        lastName: data?.lastName,
        password: data?.password,
        confirmPassword: data?.confirmPassword,
        remember_me: rememberMe,
      }).unwrap();

      toast.success('Account Created Successfully', {
        description: `Welcome, ${result.data.user.firstName}! You're now signed in.`,
      });

      signupForm.reset();
      // Slight delay to show toast
      setTimeout(() => router.push(returnTo), 800);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.error || 'Something went wrong. Please try again.';

      toast.error('Signup Failed', {
        description: errorMessage,
      });
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      if (!['google', 'facebook'].includes(provider)) {
        throw new Error('Unsupported OAuth provider');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('Missing NEXT_PUBLIC_API_URL');
      }

      // Track redirect attempt to avoid double-tap
      if (typeof window !== 'undefined') {
        if ((window as any).isRedirecting) return;
        (window as any).isRedirecting = true;
      }

      // Attempt redirect
      window.location.assign(`${baseUrl}/api/v1/auth/${provider}`);
    } catch (err: any) {
      // Fallback feedback
      toast.error(
        err?.message
          ? `OAuth failed: ${err.message}`
          : 'Something went wrong during login. Please try again.',
      );
    } finally {
      if (typeof window !== 'undefined') {
        (window as any).isRedirecting = false;
      }
    }
  };

  // Signin Form
  const renderSigninForm = () => (
    <form onSubmit={signinForm.handleSubmit(signInSubmit)} className="flex flex-col gap-3">
      <FormField<SigninFormData>
        label="Email"
        id="email"
        type="email"
        placeholder="Enter your email"
        register={signinForm.register}
        error={signinForm.formState.errors.email?.message as string}
      />
      <div className="relative">
        <FormField<SigninFormData>
          label="Password"
          id="password"
          type={showPass ? 'text' : 'password'}
          placeholder="Enter your password"
          register={signinForm.register}
          error={signinForm.formState.errors.password?.message as string}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const input = document.getElementById('password') as HTMLInputElement;
            const start = input?.selectionStart || 0;
            const end = input?.selectionEnd || 0;

            setShowPass(!showPass);
            // Restore cursor on next tick
            setTimeout(() => {
              input?.setSelectionRange(start, end);
            }, 0);
          }}
          className="absolute top-10 right-5 size-3"
        >
          {showPass ? (
            <AiOutlineEye className="size-5" />
          ) : (
            <AiOutlineEyeInvisible className="size-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className="text-foreground flex items-center gap-2 text-sm font-medium select-none"
        >
          {rememberMe ? (
            <span className="border-primary inline-block size-6 rounded-[5px] border-2" />
          ) : (
            <IoCheckboxOutline className="text-primary size-6" />
          )}
          Remember Me
        </button>
        <Link
          href="/forgot-password"
          className="text-foreground text-sm font-medium hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSigninLoading}
        className="bg-primary hover:bg-primary/90 disabled:hover:bg-primary text-primary-foreground mt-4 w-full rounded-sm py-2.25 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSigninLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );

  // Signup Form
  const renderSignupForm = () => (
    <form onSubmit={signupForm.handleSubmit(signUpSubmit)} className="flex flex-col gap-3">
      <FormField<SignupFormData>
        label="First Name"
        id="firstName"
        type="text"
        placeholder="Enter your first name"
        register={signupForm.register}
        error={signupForm.formState.errors.firstName?.message}
      />
      <FormField<SignupFormData>
        label="Last Name"
        id="lastName"
        type="text"
        placeholder="Enter your last name"
        register={signupForm.register}
        error={signupForm.formState.errors.lastName?.message}
      />
      <FormField<SignupFormData>
        label="Email"
        id="email"
        type="email"
        placeholder="Enter your email"
        register={signupForm.register}
        error={signupForm.formState.errors.email?.message as string}
      />
      <div className="relative">
        <FormField<SignupFormData>
          label="Password"
          id="password"
          type={showPass ? 'text' : 'password'}
          placeholder="Enter your password"
          register={signupForm.register}
          error={signupForm.formState.errors.password?.message as string}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const input = document.getElementById('password') as HTMLInputElement;
            const start = input?.selectionStart || 0;
            const end = input?.selectionEnd || 0;

            setShowPass(!showPass);
            // Restore cursor on next tick
            setTimeout(() => {
              input?.setSelectionRange(start, end);
            }, 0);
          }}
          className="absolute top-10 right-5 size-3"
        >
          {showPass ? (
            <AiOutlineEye className="size-5" />
          ) : (
            <AiOutlineEyeInvisible className="size-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <FormField<SignupFormData>
          label="Confirm Password"
          id="confirmPassword"
          type={showConfirmPass ? 'text' : 'password'}
          placeholder="Confirm your password"
          register={signupForm.register}
          error={signupForm.formState.errors.confirmPassword?.message}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const input = document.getElementById('confirmPassword') as HTMLInputElement;
            const start = input?.selectionStart || 0;
            const end = input?.selectionEnd || 0;

            setShowConfirmPass(!showConfirmPass);
            // Restore cursor on next tick
            setTimeout(() => {
              input?.setSelectionRange(start, end);
            }, 0);
          }}
          className="absolute top-10 right-5 size-3"
        >
          {showConfirmPass ? (
            <AiOutlineEye className="size-5" />
          ) : (
            <AiOutlineEyeInvisible className="size-5" />
          )}
        </button>
      </div>

      <div className="mt-1 flex flex-col gap-1">
        <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
          <input type="checkbox" id="agree" className="sr-only" {...signupForm.register('agree')} />
          <span className="mt-0.5 shrink-0">
            {agreeValue ? (
              <span className="border-primary inline-block size-5 rounded-[4px] border-2" />
            ) : (
              <IoCheckboxOutline className="text-primary size-5" />
            )}
          </span>
          <span className="text-muted-foreground text-xs leading-normal">
            I agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              className="text-primary font-semibold hover:underline"
            >
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-primary font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {signupForm.formState.errors.agree && (
          <p className="text-destructive mt-0.5 text-xs">
            {signupForm.formState.errors.agree.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSignupLoading}
        className="bg-primary hover:bg-primary/90 disabled:hover:bg-primary text-primary-foreground mt-2 w-full rounded-sm py-2.25 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSignupLoading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
      <header className="flex flex-col items-center space-y-2 text-center">
        <LogoName className="scale-125" />
        <h1 className="font-rubik mt-16 mb-10 text-2xl font-medium md:text-3xl">
          {type === 'signin' ? 'Great to have you back!' : 'Great to have you here!'}
        </h1>
        <div className="font-kumbh w-full space-y-6 font-light">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="text-foreground border-primary/40 flex w-full items-center gap-4 rounded-md border px-5 py-3"
          >
            <FaGoogle size={20} /> Continue With Google
          </button>
          {/* <button
            onClick={() => handleOAuthLogin('facebook')}
            className="text-foreground border-primary/40 flex w-full items-center gap-4 rounded-md border px-5 py-3"
          >
            <FaFacebookF size={20} /> Continue With Facebook
          </button> */}
        </div>
        <div className="my-10 flex w-full items-center">
          <hr className="border-0.5 border-border flex-1" />
          <span className="px-5 font-medium">or</span>
          <hr className="border-0.5 border-border flex-1" />
        </div>
      </header>

      {type === 'signin' ? renderSigninForm() : renderSignupForm()}

      <p className="text-muted-foreground mt-10 text-center text-sm">
        {type === 'signin' ? (
          <>
            New here?{' '}
            <Link href="/signup" className="text-primary font-semibold">
              Create Your Capture Awards Account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/signin" className="text-primary font-semibold">
              Sign In
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
