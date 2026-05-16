import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.argv.includes("--dry-run");

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = !DRY_RUN
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const COLUMNS = [
  "name",
  "level",
  "school",
  "casting_time",
  "range",
  "duration",
  "components",
  "classes",
  "description",
  "ritual",
  "concentration",
];

function parseSpellsSQL(filePath) {
  const sql = readFileSync(filePath, "utf-8");
  const tupleRegex = /\(('(?:[^']|'')*'),(\d+),('(?:[^']|'')*'),('(?:[^']|'')*'),('(?:[^']|'')*'),('(?:[^']|'')*'),('(?:[^']|'')*'),('(?:[^']|'')*'),('(?:[^']|'')*'),(true|false),(true|false)\)/g;
  const spells = [];
  let match;

  while ((match = tupleRegex.exec(sql)) !== null) {
    const spell = {};
    for (let i = 0; i < COLUMNS.length; i++) {
      const raw = match[i + 1];
      const col = COLUMNS[i];
      if (col === "level") spell[col] = parseInt(raw, 10);
      else if (col === "ritual" || col === "concentration") spell[col] = raw === "true";
      else spell[col] = raw.slice(1, -1).replace(/''/g, "'");
    }
    spells.push(spell);
  }
  return spells;
}

async function seed() {
  const spells = parseSpellsSQL(
    new URL("../spells_compendium.sql", import.meta.url).pathname
  );

  if (spells.length === 0) {
    console.error("No spells parsed from SQL file — check the format");
    process.exit(1);
  }
  console.log(`Parsed ${spells.length} spells`);

  if (DRY_RUN) {
    console.log("\n-- Dry run, showing first 5 spells --");
    for (const spell of spells.slice(0, 5)) {
      console.log(`  ${spell.name} (Level ${spell.level} ${spell.school})`);
    }
    console.log(`  ... and ${spells.length - 5} more`);
    console.log("\nNo database changes made.");
    return;
  }

  // Clear table
  const { error: deleteError } = await supabase.from("spells").delete().gte("id", 0);
  if (deleteError) {
    console.error("Delete failed:", deleteError.message);
    process.exit(1);
  }

  // Insert in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < spells.length; i += BATCH_SIZE) {
    const { error } = await supabase.from("spells").insert(spells.slice(i, i + BATCH_SIZE));
    if (error) {
      console.error(`Insert failed at batch ${i}:`, error.message);
      process.exit(1);
    }
  }

  console.log(`Inserted ${spells.length} spells`);
}

seed();
