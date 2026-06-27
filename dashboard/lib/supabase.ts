// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Browser client (use in Client Components) ─────────
export function createClient() {
  return createBrowserClient(URL, ANON);
}

// ── Server client (use in Server Components / Route Handlers) ─
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(toSet) {
        try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch {}
      },
    },
  });
}

// ── Types ─────────────────────────────────────────────
export type CallRecord = {
  id: string;
  tenant_id: string;
  voice_profile_id: string;
  caller_number: string;
  direction: "inbound" | "outbound";
  status: "active" | "completed" | "missed" | "transferred" | "failed";
  duration_seconds: number;
  transcript: Array<{ role: string; content: string; ts: string }>;
  intent: string;
  recording_url: string | null;
  wa_sent: boolean;
  appointment_created: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  caller_name: string | null;
  caller_number: string;
  service: string | null;
  slot_date: string | null;
  slot_time: string | null;
  status: string;
  wa_confirmed: boolean;
  created_at: string;
};

export type VoiceProfile = {
  id: string;
  tenant_id: string;
  profile_sku: string;
  display_name: string | null;
  business_name: string;
  open_time: string;
  close_time: string;
  open_days: string[];
  services: string[];
  appointment_types: string[];
  whatsapp_number: string | null;
  did_number: string | null;
  status: string;
};

export type Tenant = {
  id: string;
  name: string;
  plan: string;
  status: string;
  trial_ends_at: string;
  wallet_balance: number;
};

export type CallMinutes = {
  used_seconds: number;
  plan_limit_seconds: number;
};
