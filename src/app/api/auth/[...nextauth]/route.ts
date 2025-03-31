import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import auth options from lib/auth.ts

// This will handle GET and POST requests for authentication
const handler = NextAuth(authOptions);

// Export for both GET and POST requests
export { handler as GET, handler as POST };
