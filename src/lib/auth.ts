import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "build-placeholder-secret-change-me",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validUser = process.env.APP_USERNAME ?? "admin";
        const validPass = process.env.APP_PASSWORD ?? "";
        if (
          credentials?.username === validUser &&
          credentials?.password === validPass
        ) {
          return { id: "1", name: validUser };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
