// app/login/layout.tsx
'use client';

import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { MessageProvider } from '@/context/MessageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMessage } from '@/context/MessageContext';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';

const SITE_KEY = "6LeriuYSAAAAAHVS9tbgpyHLTMY2HyQyZ8EAaixz";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

interface LoginLayoutProps {
  children: React.ReactNode;
}

const LoginLayout = ({ children }: LoginLayoutProps) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { showError, showSuccess, showNotice } = useMessage();
    const router = useRouter();
    const { data: session, status } = useSession();

    const navigateToPage = (link: string) => {
        router.push(link);
    };

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/filemanager');
        }
    }, [status, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            showError('Invalid username or password');
        } else {
            showSuccess('Login success');
            router.push('/filemanager');
        }
    };

  return (
    <SessionProvider>
      <html lang="en">
        <head>
          <title>Login - Rekember Dashboard</title>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <button onClick={() => navigateToPage('signin')}>Sign In</button>
            <button onClick={() => navigateToPage('signup')}>Sign Up</button>

          <MessageProvider>
            {/* ReCAPTCHA is shared across the login pages */}
            <form onSubmit={handleLogin} className="login-form">
                {children}
                <div className="recaptcha-container">
                <ReCAPTCHA sitekey={SITE_KEY} />
                </div>
                <button type="submit">Login</button>
            </form>
          </MessageProvider>
        </body>
      </html>
    </SessionProvider>
  );
};

export default LoginLayout;
