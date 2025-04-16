'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMessage } from '@/context/MessageContext';
import { useSession } from 'next-auth/react';

const Home = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const { showError, showSuccess, showNotice } = useMessage();
	const router = useRouter();
	const { data: session, status } = useSession();

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
		<div>
			<h1>Login</h1>
			<form onSubmit={handleLogin} className="login-form">
				<label htmlFor="username">Username</label>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label htmlFor="password">Password</label>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Login</button>
			</form>
		</div>
	);
};

export default Home;
