import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the handler with the auth options from the separate file
const handler = NextAuth(authOptions);

// Export only the handler functions for GET and POST requests
export { handler as GET, handler as POST };
