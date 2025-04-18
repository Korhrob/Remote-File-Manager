import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const username = process.env.DUMMY_USER_USERNAME;
				const password = process.env.DUMMY_USER_PASSWORD;

				if (
					credentials?.username === username &&
					credentials?.password === password
				) {
					return { id: '1', name: username };
				}
				return null;
			},
		}),
	],
	pages: {
		signIn: '/login',
	},
	session: {
		strategy: 'jwt',
		maxAge: 60 * 30,
		updateAge: 60 * 30,
	},
	secret: process.env.NEXTAUTH_SECRET,
	
};
