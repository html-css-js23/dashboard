// Checks every site in sites.json and writes data/status.json + data/history.json.
import { readFile, writeFile } from "node:fs/promises";

const MAX_HISTORY = 288; // ~2 days at 10-minute intervals
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
await writeFile("data/status.json", JSON.stringify({ checked, sites: results }, null, 2) + "\n");

const history = JSON.parse(await readFile("data/history.json", "utf8"));
history.push({ t: checked, r: Object.fromEntries(results.map((s) => [s.url, s.up ? s.ms : -1])) });
await writeFile("data/history.json", JSON.stringify(history.slice(-MAX_HISTORY)) + "\n");

for (const s of results) console.log(`${s.up ? "UP  " : "DOWN"} ${s.url} ${s.code ?? s.error} ${s.ms ?? ""}`);
