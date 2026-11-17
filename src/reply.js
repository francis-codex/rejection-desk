// drafts the reviewer reply from the guideline template. anything we don't know stays as a
// visible [placeholder] so nobody sends a reply with a guess in it.

/** "demo_user=reviewer@example.com; build=57" -> { demo_user: ..., build: ... } */
export function parseFacts(s) {
  if (!s) return {};
  if (typeof s === "object") return s;
  return Object.fromEntries(
    String(s).split(/[;\n]/).map((kv) => kv.split("=")).filter((p) => p.length >= 2)
      .map(([k, ...v]) => [k.trim().toLowerCase().replace(/\s+/g, "_"), v.join("=").trim()]),
  );
}

export function draftReply(parsed, facts = {}) {
  const known = { build: parsed.facts.build || parsed.facts.version, device: parsed.facts.device, ...parseFacts(facts) };
  const g = parsed.primary;
  const body = g
    ? g.reply
    : "Thank you for the review. We have addressed the issue described in your message: {{summary}}. The fix is in build {{build}}.";
  const filled = body.replace(/\{\{(\w+)\}\}/g, (_, k) => known[k] || `[${k}]`);
  const open = [...filled.matchAll(/\[(\w+)\]/g)].map((m) => m[1]);
  return { reply: `Hello,\n\n${filled}\n\nThank you.`, missing: [...new Set(open)] };
}
