// builds the jira issue body for a parsed rejection. pure, so it can be tested without jira.
const STORE_NAME = { apple: "apple", play: "google play", solana: "solana dapp store", unknown: "store" };

const text = (t, marks) => ({ type: "text", text: t, ...(marks ? { marks } : {}) });
const para = (...c) => ({ type: "paragraph", content: c });
const heading = (t) => ({ type: "heading", attrs: { level: 3 }, content: [text(t)] });

export function issueSummary(parsed) {
  const g = parsed.primary;
  const tag = g ? `${parsed.store} ${g.code}` : `${parsed.store} rejection`;
  const title = g ? g.title : "unclassified rejection";
  const { version, build, submissionId } = parsed.facts;
  const ver = version ? ` — app ${version}${build ? ` (${build})` : ""}` : build ? ` — build ${build}` : "";
  const sub = submissionId ? ` · submission ${submissionId.slice(0, 8)}` : "";
  return `[${tag}] ${title}${ver}${sub}`.slice(0, 254);
}

export function issueDescription(parsed, rejectionText) {
  const g = parsed.primary;
  let n = 0;
  const id = () => `t${++n}`;
  const content = [];
  content.push(para(text("store: ", [{ type: "strong" }]), text(STORE_NAME[parsed.store] || parsed.store)));
  if (g) {
    content.push(heading("what it means"), para(text(g.meaning)));
    content.push(heading("fix checklist"), {
      type: "taskList", attrs: { localId: "fix" },
      content: g.fixes.map((f) => ({ type: "taskItem", attrs: { localId: id(), state: "TODO" }, content: [text(f)] })),
    });
  } else {
    content.push(para(text("no known guideline matched. read the rejection below and add the rule to src/guidelines.js.")));
  }
  if (parsed.others.length) {
    content.push(heading("also mentioned"), {
      type: "bulletList",
      content: parsed.others.map((o) => ({ type: "listItem", content: [para(text(`${o.code} ${o.title}`))] })),
    });
  }
  const f = parsed.facts;
  const facts = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ");
  if (facts) content.push(heading("submission"), para(text(facts)));
  if (rejectionText) content.push(heading("rejection as received"), { type: "codeBlock", content: [text(String(rejectionText).slice(0, 8000))] });
  return { type: "doc", version: 1, content };
}

/** fields for POST /rest/api/3/issue */
export function buildIssue(parsed, rejectionText, projectKey, issueType = "Task") {
  if (!projectKey) throw new Error("projectKey is required");
  const labels = ["store-rejection", `store-${parsed.store}`];
  if (parsed.primary) labels.push(`rule-${parsed.primary.id}`.replace(/[^a-z0-9_.-]/gi, "-"));
  return {
    fields: {
      project: { key: projectKey.toUpperCase() },
      issuetype: { name: issueType },
      summary: issueSummary(parsed),
      labels,
      description: issueDescription(parsed, rejectionText),
    },
  };
}
