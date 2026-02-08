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

export async function listActiveFields(city?: string) {
  let q = supabase
    .from("fields")
    .select("id,name,address,city,is_active")
    .eq("is_active", true)
    .order("city", { ascending: true });

  if (city) q = q.eq("city", city);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function listMyMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("id, city, start_time, duration_min, skill_level, players_needed, price_per_player_cents, status, fields(name)")
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createMatchDraft(payload: {
  userId: string;
  city: string;
  field_id: string | null;
  start_time: string;
  duration_min: number;
  skill_level: "beginner" | "intermediate" | "advanced" | null;
  players_needed: number;
  price_per_player_cents: number;
}) {
  const { data, error } = await supabase
    .from("matches")
    .insert([{
      created_by: payload.userId,
      city: payload.city,
      field_id: payload.field_id,
      start_time: payload.start_time,
      duration_min: payload.duration_min,
      skill_level: payload.skill_level,
      players_needed: payload.players_needed,
      price_per_player_cents: payload.price_per_player_cents,
      status: "draft",
    }])
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function setMatchStatus(matchId: string, status: "draft" | "published" | "canceled") {
  const { error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId);

  if (error) throw error;
}

export async function getRosterCounts(matchId: string) {
  const { data, error } = await supabase
    .from("participations")
    .select("status")
    .eq("match_id", matchId);

  if (error) throw error;

  const counts = { pending_payment: 0, confirmed: 0, canceled: 0, refunded: 0 };
  for (const r of (data ?? [])) {
    if (r.status && counts[r.status as keyof typeof counts] !== undefined) {
      counts[r.status as keyof typeof counts] += 1;
    }
  }
  return counts;
}

export async function getMetricsLast7Days() {
  const from = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const { data: matches, error: mErr } = await supabase
    .from("matches")
    .select("id, status, start_time, players_needed, price_per_player_cents")
    .gte("start_time", from);

  if (mErr) throw mErr;

  const matchIds = (matches ?? []).map(x => x.id);
  let parts: any[] = [];
  if (matchIds.length > 0) {
    const { data: p, error: pErr } = await supabase
      .from("participations")
      .select("match_id, status")
      .in("match_id", matchIds);
    if (pErr) throw pErr;
    parts = p ?? [];
  }

  const publishedCount = (matches ?? []).filter(x => x.status === "published").length;

  const confirmedByMatch = new Map<string, number>();
  const pendingByMatch = new Map<string, number>();

  for (const p of parts) {
    if (p.status === "confirmed") confirmedByMatch.set(p.match_id, (confirmedByMatch.get(p.match_id) ?? 0) + 1);
    if (p.status === "pending_payment") pendingByMatch.set(p.match_id, (pendingByMatch.get(p.match_id) ?? 0) + 1);
  }

  let fillRateSum = 0;
  let fillRateN = 0;
  let gmvCents = 0;
  let pendingTotal = 0;
  let confirmedTotal = 0;

  for (const match of (matches ?? [])) {
    const conf = confirmedByMatch.get(match.id) ?? 0;
    const pend = pendingByMatch.get(match.id) ?? 0;

    confirmedTotal += conf;
    pendingTotal += pend;

    if (match.players_needed && match.players_needed > 0) {
      fillRateSum += conf / match.players_needed;
      fillRateN += 1;
    }

    gmvCents += conf * (match.price_per_player_cents ?? 0);
  }

  const avgFillRate = fillRateN > 0 ? fillRateSum / fillRateN : 0;
  const conversion = (pendingTotal + confirmedTotal) > 0 ? (confirmedTotal / (pendingTotal + confirmedTotal)) : 0;

  return {
    publishedCount,
    avgFillRate,
    gmvCents,
    conversion,
  };
}
