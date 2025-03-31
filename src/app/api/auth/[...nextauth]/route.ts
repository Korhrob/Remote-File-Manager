import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Dummy user for testing (replace with DB check)
        const username = process.env.DUMMY_USER_USERNAME;
        const password = process.env.DUMMY_USER_PASSWORD;

        if (
          credentials?.username === username &&
          credentials?.password === password
        ) {
          return { id: "1", name: username }; // Authentication success
        }
        return null; // Authentication failed
      }
    })
  ],
  pages: {
    signIn: "/", // Optional: Custom login page
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET, // Set this in .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
