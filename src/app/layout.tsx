'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { MessageProvider, useMessage } from '../context/MessageContext';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

interface RootLayoutProps {
	children: React.ReactNode;
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SessionProvider>
			<html lang="en">
				<head>
					<title>Rekember Dashboard</title>
					<link rel="icon" href="/favicon.ico" />
				</head>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<MessageProvider>
						{children}
						<MessageDisplay />
					</MessageProvider>
				</body>
			</html>
		</SessionProvider>
	);
};

const MessageDisplay = () => {
	const { message, messageType, visible } = useMessage();

	if (!message) return null;

	return (
		<div className="status-container">
			<div
				className={`status-message ${visible ? 'show' : ''} ${
					messageType === 'success'
						? 'status-success'
						: messageType === 'error'
							? 'status-error'
							: 'status-notice'
				}`}
			>
				{message}
			</div>
		</div>
	);
};

export default RootLayout;
