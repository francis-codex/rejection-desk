// turns a pasted store rejection into structured facts. pure, no network.
import { GUIDELINES } from "./guidelines.js";

const STORES = [
  ["solana", [/dapp store/i, /LEG-\d{3}/i, /\bseeker\b/i, /solana mobile/i]],
  ["play", [/google play/i, /play console/i, /\bpolicy (status|issue|declaration)/i, /version code/i, /app access/i]],
  ["apple", [/app store/i, /app review/i, /resolution center/i, /app store connect/i, /guideline \d/i]],
];

export function detectStore(text) {
  let best = null, bestHits = 0;
  for (const [store, pats] of STORES) {
    const hits = pats.filter((p) => p.test(text)).length;
    if (hits > bestHits) { best = store; bestHits = hits; }
  }
  return best;
}

const pick = (text, re) => { const m = text.match(re); return m ? m[1].trim() : null; };

export function extractFacts(text) {
  return {
    submissionId: pick(text, /submission id[:\s]+([a-z0-9-]{6,})/i),
    version: pick(text, /version[:\s]+(\d+\.\d+(?:\.\d+)?)/i),
    build: pick(text, /(?:build|version code)[:\s]+\(?(\d+)\)?/i),
    date: pick(text, /(?:review date|date|reviewed on)[:\s]+([0-9]{1,2} [a-z]+ [0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i),
    device: pick(text, /reviewed on[:\s]+(i(?:phone|pad)[^,\n]*|pixel[^,\n]*)/i),
  };
}

/** every guideline the text hits, primary first. limited to the detected store when there is one. */
export function matchGuidelines(text, store = detectStore(text)) {
  const pool = store ? GUIDELINES.filter((g) => g.store === store) : GUIDELINES;
  return pool.filter((g) => g.match.some((re) => re.test(text)));
}

export function parseRejection(text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("paste the rejection text first");
  const store = detectStore(clean);
  const matches = matchGuidelines(clean, store);
  return {
    store: store || "unknown",
    primary: matches[0] || null,
    others: matches.slice(1),
    facts: extractFacts(clean),
  };
}
