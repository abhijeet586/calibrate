import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Read .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      url = trimmed.split("=")[1]?.trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=") || trimmed.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=")) {
      key = trimmed.split("=")[1]?.trim();
    }
  }
}

console.log("Connecting to Supabase at:", url);
const supabase = createClient(url!, key!);

async function testConnection() {
  const { data: roles, error: rolesError } = await supabase.from("target_roles").select("id, name");
  console.log("target_roles query:", { count: roles?.length, rolesError });

  const { data: skills, error: skillsError } = await supabase.from("market_skills").select("id, name");
  console.log("market_skills query:", { count: skills?.length, skillsError });

  const { data: updates, error: updatesError } = await supabase.from("market_updates").select("id, title");
  console.log("market_updates query:", { count: updates?.length, updatesError });
}

testConnection();
