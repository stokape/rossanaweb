// Aplica supabase/migrations/*.sql (en orden) y luego supabase/seed.sql
// contra la base de datos indicada por variables de entorno.
// Uso: DB_HOST=... DB_PASSWORD=... node scripts/run-migrations.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");
const seedFile = join(root, "supabase", "seed.sql");

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Conectado a:", process.env.DB_HOST);

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`→ Aplicando ${file} ...`);
    try {
      await client.query(sql);
      console.log(`  OK`);
    } catch (err) {
      console.error(`  ERROR en ${file}:`, err.message);
      throw err;
    }
  }

  console.log("→ Aplicando seed.sql ...");
  const seedSql = readFileSync(seedFile, "utf8");
  await client.query(seedSql);
  console.log("  OK");

  console.log("\n✅ Migraciones y seed aplicados correctamente.");
  await client.end();
}

main().catch(async (err) => {
  console.error("\n❌ Falló la aplicación de migraciones.");
  console.error(err);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
