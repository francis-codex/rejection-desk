// forge handlers for the rovo agent's three actions.
import api, { route } from "@forge/api";
import { parseRejection } from "./parse.js";
import { buildIssue } from "./issue.js";
import { draftReply } from "./reply.js";

const view = (p) => ({
  store: p.store,
  guideline: p.primary ? `${p.primary.code} ${p.primary.title}` : "no match",
  meaning: p.primary?.meaning || "no known rule matched this text",
  severity: p.primary?.severity || "unknown",
  fixes: p.primary?.fixes || [],
  alsoMentioned: p.others.map((o) => `${o.code} ${o.title}`),
  submission: p.facts,
});

export async function parseRejectionAction(payload) {
  try { return view(parseRejection(payload.rejectionText)); }
  catch (e) { return { error: e.message }; }
}

export async function createFixIssueAction(payload, context) {
  try {
    const parsed = parseRejection(payload.rejectionText);
    const projectKey = payload.projectKey || context?.jira?.projectKey;
    const body = buildIssue(parsed, payload.rejectionText, projectKey, payload.issueType || "Task");
    const res = await api.asUser().requestJira(route`/rest/api/3/issue`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const out = await res.json();
    if (!res.ok) return { error: `jira said ${res.status}`, detail: out.errors || out.errorMessages };
    return { created: out.key, summary: body.fields.summary, checklistItems: parsed.primary?.fixes.length || 0 };
  } catch (e) { return { error: e.message }; }
}

export async function draftReplyAction(payload) {
  try {
    const parsed = parseRejection(payload.rejectionText);
    return draftReply(parsed, payload.facts);
  } catch (e) { return { error: e.message }; }
}
