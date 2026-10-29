// Checks every site in sites.json and writes status.json + history.json into OUT_DIR.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const OUT = process.env.OUT_DIR || "data";
const MAX_HISTORY = 288; // 24 hours at 5-minute intervals
const sites = JSON.parse(await readFile("sites.json", "utf8"));

async function check(site) {
  const start = Date.now();
  try {
    const res = await fetch(site.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "status-dashboard (+github actions)" },
    });
    return { ...site, up: res.status < 400, code: res.status, ms: Date.now() - start };
  } catch (err) {
    return { ...site, up: false, code: null, ms: null, error: err.cause?.code || err.name };
  }
}

const checked = new Date().toISOString();
const results = await Promise.all(sites.map(check));
await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/status.json`, JSON.stringify({ checked, sites: results }, null, 2) + "\n");

const history = JSON.parse(await readFile(`${OUT}/history.json`, "utf8").catch(() => "[]"));
history.push({ t: checked, r: Object.fromEntries(results.map((s) => [s.url, s.up ? s.ms : -1])) });
await writeFile(`${OUT}/history.json`, JSON.stringify(history.slice(-MAX_HISTORY)) + "\n");

for (const s of results) console.log(`${s.up ? "UP  " : "DOWN"} ${s.url} ${s.code ?? s.error} ${s.ms ?? ""}`);
