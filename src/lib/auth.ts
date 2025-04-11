import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ethers } from "ethers";

// This is a simple example of how you can verify a signature
const verifySignature = (message: string, signature: string, address: string) => {
  try {
    const signerAddr = ethers.verifyMessage(message, signature);
    return signerAddr.toLowerCase() === address.toLowerCase();
  } catch (err) {
    console.error("Error verifying signature:", err);
    return false;
  }
};

// Define NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "web3",
      name: "Web3",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.address) {
          return null;
        }

        // Verify the signature
        const isValid = verifySignature(
          credentials.message,
          credentials.signature,
          credentials.address
        );

        if (isValid) {
          return {
            id: credentials.address,
            address: credentials.address,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to the token
      if (user) {
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to the session
      if (token && session.user) {
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
