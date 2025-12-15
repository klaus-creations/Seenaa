import 'dotenv/config';

import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../database/db';
import { sendEmail } from './mail';
import { username } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3000', 'http://localhost:5500'],
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        html: `<p><a href="${url}">Verify Email</a></p>`,
        text: `Verify Email: ${url}`,
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: 'http://localhost:5500/api/auth/callback/google',
    },
  },

  // Origin Issues
  account: {
    accountLinking: {
      enabled: true,
    },
  },

  // Advanced Options
  advanced: {
    cookiePrefix: 'arif-hasab',
    useSecureCookies: false,
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: false,
    },
  },
  // Plugins
  plugins: [
    expo(),
    username({
      maxUsernameLength: 100,
      minUsernameLength: 3,
      usernameValidator(username) {
        const usernameRegex = /^@[a-zA-Z0-9_]+$/;
        return usernameRegex.test(username);
      },
    }),
  ],
});
