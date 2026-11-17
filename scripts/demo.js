// dry run: every demo rejection through parse -> issue -> reply, no jira needed.
import { readdirSync, readFileSync } from "node:fs";
import { parseRejection } from "../src/parse.js";
import { buildIssue } from "../src/issue.js";
import { draftReply } from "../src/reply.js";

const dir = new URL("../demo/rejections/", import.meta.url);
for (const f of readdirSync(dir).filter((x) => x.endsWith(".txt")).sort()) {
  const raw = readFileSync(new URL(f, dir), "utf8");
  const p = parseRejection(raw);
  const issue = buildIssue(p, raw, "MOB");
  const { reply, missing } = draftReply(p, "demo_user=reviewer@example.com");
  console.log(`\n=== ${f}`);
  console.log(`store: ${p.store} · rule: ${p.primary ? p.primary.code + " " + p.primary.title : "no match"}`);
  console.log(`jira: ${issue.fields.summary}`);
  console.log(`labels: ${issue.fields.labels.join(", ")}`);
  (p.primary?.fixes || []).forEach((x, i) => console.log(`  ${i + 1}. ${x}`));
  console.log(`reply:\n${reply.replace(/^/gm, "  | ")}`);
  if (missing.length) console.log(`open placeholders: ${missing.join(", ")}`);
}
