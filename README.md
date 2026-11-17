# rejection desk

a rovo agent for jira that turns an app store, google play or solana dapp store rejection into work.

paste the rejection. the agent tells you which rule you broke and what it means in plain english, opens a jira ticket with a fix checklist, and drafts the reply to the reviewer. anything it doesn't know stays as a `[placeholder]`, so nobody sends a reviewer a guess.

built from real rejections of a live wallet app across all three stores (redacted samples in `demo/rejections/`).

## what it does

| action | verb | what you get |
|---|---|---|
| `parse-rejection` | GET | store, rule, plain meaning, severity, fix checklist, submission id / version / build |
| `create-fix-issue` | CREATE | a jira issue: `[apple 2.1(a)] app completeness: demo account — app 1.0.3 (44)`, labels, a checklist (adf task list), the original text |
| `draft-reply` | GET | resolution center / play console reply, with the open placeholders listed |

rules covered: apple 2.1, 2.1(a), 2.3, 3.1.1, 3.1.5, 4.2, 4.8, 5.1.1, 5.1.1(v) · play app access, financial features, data safety, permissions, target api, deceptive behaviour · solana dapp store LEG-001. each one is a plain-english summary in `src/guidelines.js`, not store text. add a rule by adding an entry.

## run it locally (no jira)

```
npm install
npm test        # 13 tests
npm run demo    # every sample rejection through parse -> issue -> reply
```

## install on your site

```
npm install -g @forge/cli
forge login
forge register          # writes the app id into manifest.yml
forge deploy
forge install           # pick your jira site
```

then open rovo in jira, pick **rejection desk**, and paste a rejection.

## privacy

the agent never asks for passwords. demo account passwords go straight into the store console. the only data stored is the jira issue you ask it to create.

## license

mit
