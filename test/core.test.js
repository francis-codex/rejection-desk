import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRejection, detectStore } from "../src/parse.js";
import { buildIssue } from "../src/issue.js";
import { draftReply, parseFacts } from "../src/reply.js";
import { GUIDELINES } from "../src/guidelines.js";

const demo = (f) => readFileSync(new URL(`../demo/rejections/${f}`, import.meta.url), "utf8");

const cases = [
  ["apple-2.1-info-needed.txt", "apple", "apple-2.1-info"],
  ["apple-2.1a-demo-account.txt", "apple", "apple-2.1a-demo"],
  ["play-login-credentials-missing.txt", "play", "play-app-access"],
  ["play-couldnt-sign-in.txt", "play", "play-app-access"],
  ["seeker-leg-001.txt", "solana", "seeker-leg-001"],
];
for (const [f, store, id] of cases) {
  test(`classifies ${f}`, () => {
    const p = parseRejection(demo(f));
    assert.equal(p.store, store);
    assert.equal(p.primary?.id, id);
  });
}

test("extracts submission facts", () => {
  const p = parseRejection(demo("apple-2.1a-demo-account.txt"));
  assert.equal(p.facts.version, "1.0.3");
  assert.equal(p.facts.build, "44");
  assert.match(p.facts.submissionId, /^5d3160fd/);
  assert.match(p.facts.device, /iPhone 17 Pro/);
  assert.equal(parseRejection(demo("play-login-credentials-missing.txt")).facts.build, "55");
});

test("unknown text has no primary and no store", () => {
  const p = parseRejection("hello, something went wrong");
  assert.equal(p.store, "unknown");
  assert.equal(p.primary, null);
  assert.equal(detectStore("nothing here"), null);
});

test("empty text throws", () => assert.throws(() => parseRejection("  ")));

test("issue payload is valid jira shape with a checklist", () => {
  const raw = demo("apple-2.1a-demo-account.txt");
  const { fields } = buildIssue(parseRejection(raw), raw, "mob");
  assert.equal(fields.project.key, "MOB");
  assert.match(fields.summary, /^\[apple 2\.1\(a\)\] app completeness: demo account — app 1\.0\.3 \(44\)/);
  assert.ok(fields.labels.includes("store-rejection"));
  assert.ok(fields.labels.every((l) => !/\s/.test(l)), "labels have no spaces");
  const tl = fields.description.content.find((n) => n.type === "taskList");
  assert.equal(tl.content.length, 5);
  const ids = tl.content.map((t) => t.attrs.localId);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(tl.content.every((t) => t.attrs.state === "TODO"));
});

test("issue needs a project key", () => assert.throws(() => buildIssue(parseRejection(demo("seeker-leg-001.txt")), "", "")));

test("reply fills known facts and leaves the rest as placeholders", () => {
  const p = parseRejection(demo("apple-2.1a-demo-account.txt"));
  const { reply, missing } = draftReply(p, "demo_user=reviewer@example.com");
  assert.match(reply, /reviewer@example\.com/);
  assert.deepEqual(missing, ["steps"]);
});

test("parseFacts handles = in values and spaces in keys", () => {
  assert.deepEqual(parseFacts("Demo User=a=b; build = 57"), { demo_user: "a=b", build: "57" });
});

test("guideline ids are unique and every entry is complete", () => {
  const ids = GUIDELINES.map((g) => g.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const g of GUIDELINES) {
    assert.ok(g.match.length && g.fixes.length && g.reply && g.meaning, g.id);
  }
});
