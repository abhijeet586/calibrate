import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local
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

const supabase = createClient(url, key);

async function runTestSuite() {
  console.log("==================================================");
  console.log("       CALIBRATE FULL APPLICATION TEST SUITE       ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || "");
      failed++;
    }
  }

  // TEST 1: Supabase connectivity & target_roles
  try {
    const { data: roles, error } = await supabase.from("target_roles").select("*");
    assert(!error && Array.isArray(roles) && roles.length > 0, "Fetch target_roles career tracks", { count: roles?.length, error });
  } catch (e) {
    assert(false, "Fetch target_roles career tracks", e);
  }

  // TEST 2: Market Skills
  try {
    const { data: skills, error } = await supabase.from("market_skills").select("*");
    assert(!error && Array.isArray(skills) && skills.length > 0, "Fetch market_skills catalog", { count: skills?.length, error });
  } catch (e) {
    assert(false, "Fetch market_skills catalog", e);
  }

  // TEST 3: Market Updates Feed & Author Profile Mapping
  try {
    const { data: updates, error } = await supabase.from("market_updates").select("id, title, content, posted_by");
    assert(!error && Array.isArray(updates), "Fetch market_updates feed items", { count: updates?.length, error });

    const authorIds = [...new Set(updates?.map(u => u.posted_by).filter(Boolean))];
    if (authorIds.length > 0) {
      const { data: profiles, error: pError } = await supabase.from("profiles").select("id, full_name").in("id", authorIds);
      assert(!pError, "Map author profiles for feed items", { error: pError });
    } else {
      assert(true, "Map author profiles (clean feed fallback)");
    }
  } catch (e) {
    assert(false, "Market updates & profile mapping", e);
  }

  // TEST 4: Roadmap Items
  try {
    const { data: roadmap, error } = await supabase.from("roadmap_items").select("id, instruction, skill_id");
    assert(!error && Array.isArray(roadmap), "Fetch roadmap_items milestones", { count: roadmap?.length, error });
  } catch (e) {
    assert(false, "Fetch roadmap_items milestones", e);
  }

  // TEST 5: Verify Student Progress & Mentor Queue mapping logic
  try {
    const { data: progress, error } = await supabase
      .from("student_progress")
      .select("id, student_id, proof_link, status")
      .eq("status", "pending");

    assert(!error, "Query pending student submissions without PostgREST relationship error", { error });

    if (progress && progress.length > 0) {
      const sIds = [...new Set(progress.map(p => p.student_id).filter(Boolean))];
      const { data: profs, error: profError } = await supabase.from("profiles").select("id, full_name").in("id", sIds);
      assert(!profError, "Query student profiles for mentor review queue", { profError });
    } else {
      assert(true, "Mentor review queue safe profile resolution (0 pending items)");
    }
  } catch (e) {
    assert(false, "Mentor review queue test", e);
  }

  // TEST 6: HTTP Endpoint Live Tests against dev server
  const endpoints = [
    { path: "/", expectedStatus: 200, name: "Landing Page" },
    { path: "/auth/login", expectedStatus: 200, name: "Login Page" },
    { path: "/auth/register", expectedStatus: 200, name: "Register Page" },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep.path}`);
      assert(res.status === ep.expectedStatus, `HTTP GET ${ep.path} (${ep.name}) returned ${res.status}`);
    } catch (e) {
      assert(false, `HTTP GET ${ep.path} (${ep.name})`, e.message);
    }
  }

  console.log("==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
