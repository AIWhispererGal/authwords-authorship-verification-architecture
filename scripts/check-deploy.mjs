// Checks a deployed AuthWords instance without a browser.
// Run: node scripts/check-deploy.mjs https://your-site.example
const base = (process.argv[2] || process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
let failed = false;
async function check(label, path, expect) {
  try {
    const response = await fetch(base + path, { redirect: "manual" });
    const text = await response.text();
    const detail = await expect(response, text);
    console.log(`${detail ? "ok  " : "FAIL"} ${label.padEnd(28)} ${response.status} ${typeof detail === "string" ? detail : ""}`);
    if (!detail) failed = true;
  } catch (error) { console.log(`FAIL ${label.padEnd(28)} ${error.message}`); failed = true; }
}
await check("health (database)", "/api/health", (r, t) => { const j = JSON.parse(t); return j.ok ? "database reachable" : `configured=${j.configured} ${j.error?.reason || ""}`.trim() && false; });
await check("public demo page", "/demo", r => r.status === 200);
await check("demo compare API", "/api/demo/compare?scenario=other-human", (r, t) => r.status === 200 && `score ${JSON.parse(t).score}`);
await check("demo corpus download", "/api/demo/corpus", r => r.status === 200);
await check("blueprint markdown", "/api/blueprint", r => r.status === 200);
await check("workspace shell", "/?view=flip", r => r.status === 200);
await check("JWKS (database)", "/api/credentials/jwks", (r, t) => r.status === 200 && JSON.parse(t).keys?.length > 0 && "Ed25519 key published");
console.log(failed ? "\nSome checks failed." : "\nAll deploy checks passed.");
process.exit(failed ? 1 : 0);
