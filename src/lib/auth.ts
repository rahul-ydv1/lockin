import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signInSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/lib/permissions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = signInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user || !user.passwordHash || !user.isActive) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role as Role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // If authenticating via Google OAuth, automatically sync / create user in database
      if (account?.provider === "google") {
        if (!user.email) return false;
        const normalizedEmail = user.email.toLowerCase().trim();

        try {
          let existingUser = await db.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!existingUser) {
            const baseUsername = (user.name || normalizedEmail.split("@")[0])
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "") || "user";
            let username = baseUsername;
            let counter = 1;
            while (await db.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter++}`;
            }

            existingUser = await db.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || "Google User",
                username,
                avatarUrl: user.image || null,
                role: "USER",
              },
            });
          }

          user.id = existingUser.id;
          user.role = existingUser.role;
          user.username = existingUser.username;
          return true;
        } catch (error) {
          console.error("Google signIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        if (user.id) {
          token.id = user.id;
        } else if (user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: user.email.toLowerCase().trim() },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.username = dbUser.username;
          }
        }
        token.role = user.role || token.role || "USER";
        token.username = user.username || token.username || null;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string | null;
      }
      return session;
    },
  },
});
