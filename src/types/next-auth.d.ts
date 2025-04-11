import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      address: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    address: string;
    name?: string;
    email?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    address: string;
    name?: string;
    email?: string;
    picture?: string;
  }
}
