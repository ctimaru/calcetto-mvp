import { supabase } from "./supabaseClient";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function register(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, role, name, age, skill_level, home_city")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function listMatches(city: string) {
  const { data, error } = await supabase
    .from("matches")
    .select("id, city, start_time, duration_min, skill_level, players_needed, price_per_player_cents, status, fields(name,address)")
    .eq("status", "published")
    .eq("city", city)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getMatchDetail(matchId: string) {
  const { data, error } = await supabase
    .from("matches")
    .select("id, city, start_time, duration_min, skill_level, players_needed, price_per_player_cents, status, field_id, fields(name,address)")
    .eq("id", matchId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMyParticipation(matchId: string, userId: string) {
  const { data, error } = await supabase
    .from("participations")
    .select("id, status, created_at")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function joinMatch(matchId: string, userId: string) {
  const { data, error } = await supabase
    .from("participations")
    .insert([{ match_id: matchId, user_id: userId, status: "pending_payment" }])
    .select("id, status, created_at")
    .single();

  if (error) throw error;
  return data;
}
