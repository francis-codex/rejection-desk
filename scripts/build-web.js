// builds the no-jira try page into web-dist/: the page, the pure src modules, and the demo rejections.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const out = new URL("web-dist/", root);
rmSync(out, { recursive: true, force: true });
mkdirSync(new URL("src/", out), { recursive: true });
cpSync(new URL("web/index.html", root), new URL("index.html", out));
for (const f of ["guidelines.js", "parse.js", "issue.js", "reply.js"]) cpSync(new URL(`src/${f}`, root), new URL(`src/${f}`, out));

const LABELS = { "apple-2.1a-demo-account": "apple 2.1(a) demo account", "apple-2.1-info-needed": "apple 2.1 info needed", "play-couldnt-sign-in": "play: couldn't sign in", "play-login-credentials-missing": "play: login credentials", "seeker-leg-001": "solana dapp store" };
const dir = new URL("demo/rejections/", root);
const samples = readdirSync(dir).filter((f) => f.endsWith(".txt")).sort()
  .map((f) => { const k = f.replace(/\.txt$/, ""); return { label: LABELS[k] || k, text: readFileSync(new URL(f, dir), "utf8") }; })
  .sort((a, b) => (a.label.startsWith("apple 2.1(a)") ? -1 : b.label.startsWith("apple 2.1(a)") ? 1 : 0));
writeFileSync(new URL("samples.js", out), `export const SAMPLES = ${JSON.stringify(samples, null, 2)};\n`);
console.log(`web-dist: ${samples.length} samples`);
