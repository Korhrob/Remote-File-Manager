'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMessage } from '@/context/MessageContext';
import { useSession } from 'next-auth/react';

import ReCAPTCHA from 'react-google-recaptcha';
const SITE_KEY = "6LeriuYSAAAAAHVS9tbgpyHLTMY2HyQyZ8EAaixz";


const signin = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const { showError, showSuccess, showNotice } = useMessage();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [showCaptcha, setCaptcha] = useState(false);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
	
	useEffect(() => {
		setCaptcha(false);
		setRecaptchaToken(null);
		if (status === 'authenticated') {
			router.push('/filemanager');
		}
	}, [status, router]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!recaptchaToken)
		{
			console.log("missing captcha token");
			setCaptcha(true);
			return;
		}

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

	const handleCaptchaChange = (token: string | null) => {
		setRecaptchaToken(token); // Set reCAPTCHA token when completed
		console.log("complete");
	};

	
	return (
		<div>
			<h1>Sign in</h1>
			<form onSubmit={handleLogin} className="login-form">
				<label htmlFor="username">Username</label>
				<input
					id="username"
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label htmlFor="password">Password</label>
				<input
					id="password"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				{ showCaptcha && 
				<>
					<div className="recaptcha-container">
					<ReCAPTCHA sitekey={SITE_KEY} onChange={handleCaptchaChange}/>
					</div>
				</>
				}
				<button type="submit">Login</button>
			</form>
		</div>
	);
};

export default signin;
