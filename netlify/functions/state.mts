import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

export default async (req: Request, context: Context) => {
  const db = getDatabase();

  if (req.method === "GET") {
    const rows = await db.sql`SELECT data FROM planner_state WHERE key = 'main'`;
    const data = rows[0]?.data ?? null;
    return new Response(JSON.stringify({ data }), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid json" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const json = JSON.stringify(body);
    await db.sql`
      INSERT INTO planner_state (key, data, updated_at)
      VALUES ('main', ${json}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/state",
};
