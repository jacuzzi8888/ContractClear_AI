import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionTokenFromRequest, getAuth0UserIdFromRequest } from "./session";
import { NextRequest } from "next/server";

export interface UserRecord {
  id: string;
  auth0_id: string | null;
  email: string | null;
  password_hash: string | null;
  full_name: string | null;
  google_refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function resolveUserUUID(request: NextRequest): Promise<string | null> {
  const localSession = await getSessionTokenFromRequest(request);
  if (localSession?.userId) {
    return localSession.userId;
  }

  const auth0Id = await getAuth0UserIdFromRequest(request);
  if (auth0Id) {
    let user = await getUserByAuth0Id(auth0Id);
    if (!user) {
      user = await createUser({ auth0Id });
    }
    return user.id;
  }

  return null;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error || !data) return null;
  return data as UserRecord;
}

export async function getUserByAuth0Id(auth0Id: string): Promise<UserRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth0_id", auth0Id)
    .single();
  
  if (error || !data) return null;
  return data as UserRecord;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  // Use admin client for email lookup during login since we don't have a session yet
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  
  if (error || !data) return null;
  return data as UserRecord;
}

export async function createUser(params: {
  auth0Id?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  fullName?: string | null;
}): Promise<UserRecord> {
  // Use admin client to create user before they have a session
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .insert({
      auth0_id: params.auth0Id || null,
      email: params.email || null,
      password_hash: params.passwordHash || null,
      full_name: params.fullName || null,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as UserRecord;
}

export async function updateUser(userId: string, params: {
  auth0Id?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  fullName?: string | null;
  googleRefreshToken?: string | null;
}): Promise<UserRecord> {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  
  if (params.auth0Id !== undefined) updateData.auth0_id = params.auth0Id;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.passwordHash !== undefined) updateData.password_hash = params.passwordHash;
  if (params.fullName !== undefined) updateData.full_name = params.fullName;
  if (params.googleRefreshToken !== undefined) updateData.google_refresh_token = params.googleRefreshToken;
  
  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserRecord;
}

export async function linkAuth0ToUser(userId: string, auth0Id: string): Promise<UserRecord> {
  // Use admin here since this might happen during the callback before session is set
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .update({ auth0_id: auth0Id, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
    
  if (error) throw error;
  return data as UserRecord;
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<UserRecord> {
  return updateUser(userId, { passwordHash });
}
