"use client";

import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL and Key are required");
  throw new Error("Supabase URL and Key are required");
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
