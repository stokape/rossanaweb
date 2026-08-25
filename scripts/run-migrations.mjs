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

  // Registro de migraciones ya aplicadas — evita reintentar `create table`
  // sobre tablas que ya existen cuando se agregan migraciones nuevas.
  await client.query(`
    create table if not exists public._applied_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);
  const { rows: appliedRows } = await client.query(
    "select filename from public._applied_migrations",
  );
  const applied = new Set(appliedRows.map((r) => r.filename));

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  let appliedCount = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`⏭  ${file} (ya aplicada)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`→ Aplicando ${file} ...`);
    try {
      await client.query(sql);
      await client.query(
        "insert into public._applied_migrations (filename) values ($1)",
        [file],
      );
      console.log(`  OK`);
      appliedCount++;
    } catch (err) {
      console.error(`  ERROR en ${file}:`, err.message);
      throw err;
    }
  }

  if (appliedCount === 0) {
    console.log("\n(no había migraciones nuevas por aplicar)");
  }

  console.log("→ Aplicando seed.sql (idempotente, usa on conflict do nothing) ...");
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
