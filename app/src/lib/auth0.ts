import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase/admin";
import { createSession } from "./auth/session";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    connection: 'google-oauth2',
    scope: 'openid profile email offline_access https://www.googleapis.com/auth/gmail.compose',
    access_type: 'offline',
    prompt: 'consent'
  },
  async beforeSessionSaved(session, idToken) {
    try {
      if (session?.user) {
        const auth0Id = session.user.sub as string;
        const supabase = getSupabaseAdmin();
        
        // Prefer refresh token for Token Vault, fall back to access token
        const tokenToStore = session.tokenSet?.refreshToken || session.tokenSet?.accessToken;
        
        if (tokenToStore) {
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("auth0_id", auth0Id)
            .single();
          
          if (existingUser) {
            await supabase
              .from("users")
              .update({ 
                google_refresh_token: tokenToStore,
                updated_at: new Date().toISOString()
              })
              .eq("id", existingUser.id);
          } else {
            await supabase
              .from("users")
              .insert({
                auth0_id: auth0Id,
                email: session.user.email as string,
                full_name: session.user.name as string,
                google_refresh_token: tokenToStore,
              });
          }
        }
      }
    } catch (e) {
      console.error("[auth0] Error in beforeSessionSaved:", e);
    }
    return session;
  },
  async onCallback(error, context, session) {
    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=" + encodeURIComponent(error.message), process.env.APP_BASE_URL)
      );
    }
    
    try {
      if (session?.user) {
        const auth0Id = session.user.sub as string;
        const supabase = getSupabaseAdmin();
        
        let { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("auth0_id", auth0Id)
          .single();
        
        if (!user) {
          const { data: newUser } = await supabase
            .from("users")
            .insert({
              auth0_id: auth0Id,
              email: session.user.email as string,
              full_name: session.user.name as string,
            })
            .select()
            .single();
          user = newUser;
        }
        
        if (user) {
          const localSession = await createSession({
            userId: user.id,
            email: user.email,
            auth0Id: user.auth0_id,
          });
          
          const response = NextResponse.redirect(
            new URL(context.returnTo || "/dashboard", process.env.APP_BASE_URL)
          );
          
          response.cookies.set("session", localSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });
          
          return response;
        }
      }
    } catch (e) {
      console.error("[auth0] Error in onCallback:", e);
    }
    
    return NextResponse.redirect(
      new URL(context.returnTo || "/dashboard", process.env.APP_BASE_URL)
    );
  },
});

