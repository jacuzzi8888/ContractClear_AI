import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { updateUser, getUserByAuth0Id, createUser } from "./auth/get-user";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    connection: 'google-oauth2',
    scope: 'openid profile email offline_access https://www.googleapis.com/auth/gmail.compose',
    access_type: 'offline',
    prompt: 'consent'
  },
  async beforeSessionSaved(session, idToken) {
    if (session.refreshToken) {
      const auth0Id = session.user.sub as string;
      let user = await getUserByAuth0Id(auth0Id);
      if (!user) {
         user = await createUser({ auth0Id });
      }
      if (user) {
        await updateUser(user.id, { googleRefreshToken: session.refreshToken as string });
      }
    }
    return session;
  },
  async onCallback(error, context) {
    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent(error.message), process.env.APP_BASE_URL)
      );
    }
    return NextResponse.redirect(
      new URL(context.returnTo || "/dashboard", process.env.APP_BASE_URL)
    );
  },
});

