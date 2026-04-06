import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    connection: 'google-oauth2',
    scope: 'openid profile email offline_access https://www.googleapis.com/auth/gmail.compose',
    access_type: 'offline',
    prompt: 'consent'
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

