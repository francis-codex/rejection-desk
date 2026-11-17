// the knowledge base. every entry is our own plain-english summary of a store rule,
// written from real rejections, never a copy of the store's text.
// match: regexes tried against the rejection. the first entry with a hit wins, so
// specific entries (2.1(a)) sit above general ones (2.1).
// fixes: the checklist that goes into the jira issue. reply: what the reviewer needs to hear back.

export const GUIDELINES = [
  // ---------------- apple ----------------
  {
    id: "apple-2.1a-demo", store: "apple", code: "2.1(a)", title: "app completeness: demo account",
    match: [/2\.1\s*\(a\)/i, /demo account/i, /(sign[- ]?in|login) (credentials|information).{0,40}(review|access)/i],
    meaning: "the reviewer could not get past sign-in. they need a working demo account, or a way in without one.",
    severity: "blocker",
    fixes: [
      "create a reviewer account that never expires and has no 2fa or biometric step",
      "fill app review information > sign-in information with the exact username and password",
      "seed the account with enough data that every main screen has something on it",
      "if sign-in uses passkeys or a device pin, write the step-by-step path in the review notes",
      "sign in on a clean device with only those notes before resubmitting",
    ],
    reply: "We have added a demo account to App Review Information. Username: {{demo_user}}. It needs no two-factor step and is pre-loaded with sample data. Steps after sign-in: {{steps}}.",
  },
  {
    id: "apple-2.1-info", store: "apple", code: "2.1", title: "information needed",
    match: [/2\.1\b.{0,40}information needed/i, /information needed/i, /we need additional information/i],
    meaning: "not a bug report. the reviewer has questions and the build is on hold until they are answered.",
    severity: "info",
    fixes: [
      "answer every numbered question from the reviewer, in order, one paragraph each",
      "if they ask for a screen recording, film the whole flow on a physical device from a fresh install",
      "say which build the answers apply to",
      "reply in resolution center, then resubmit the same build unless the code changed",
    ],
    reply: "Thank you for the review. Our answers, in the order asked:\n{{answers}}\nA screen recording of the full flow on a physical device is attached. These answers apply to build {{build}}.",
  },
  {
    id: "apple-2.1-crash", store: "apple", code: "2.1", title: "app completeness: crash or bug",
    match: [/2\.1\b.{0,60}(crash|bug|error|did not load|unresponsive)/i, /performance.{0,20}app completeness/i],
    meaning: "the reviewer hit a crash, a dead button or an error screen during review.",
    severity: "blocker",
    fixes: [
      "find the device and os version in the rejection and reproduce on the same pair",
      "pull the crash log attached in resolution center and symbolicate it",
      "fix, add a test for the path, and ship a new build number",
      "check the same flow on ipv6-only network, apple review runs on one",
    ],
    reply: "We reproduced the issue on {{device}} running {{os}}. The cause was {{cause}}. Build {{build}} fixes it and we have re-tested the full flow on a physical device.",
  },
  {
    id: "apple-2.3-metadata", store: "apple", code: "2.3", title: "accurate metadata",
    match: [/2\.3(\.\d+)?\b/i, /metadata/i, /screenshots? (do not|don't) (reflect|show)/i],
    meaning: "the store listing promises something the app does not show, or the screenshots are not the real app.",
    severity: "blocker",
    fixes: [
      "compare every screenshot and the description line by line against the build under review",
      "remove claims about features that are not in this build",
      "retake screenshots from the actual build, no mockups",
    ],
    reply: "We have updated the metadata so it matches build {{build}}: {{changes}}.",
  },
  {
    id: "apple-3.1.1-iap", store: "apple", code: "3.1.1", title: "in-app purchase",
    match: [/3\.1\.1/i, /in-app purchase/i],
    meaning: "apple thinks the app sells digital goods or unlocks features without using in-app purchase.",
    severity: "blocker",
    fixes: [
      "list every paid thing in the app and mark it digital or physical / real-world",
      "move digital unlocks to storekit, or remove them from the ios build",
      "remove any button or link that sends the user to an outside payment page for digital goods",
    ],
    reply: "Purchases in the app are {{what}}. {{change}}.",
  },
  {
    id: "apple-3.1.5-crypto", store: "apple", code: "3.1.5", title: "cryptocurrencies",
    match: [/3\.1\.5/i, /cryptocurrenc/i, /digital (asset|currency) (exchange|wallet)/i],
    meaning: "crypto features need the right entity type and licences, and no rewards for downloads or installs.",
    severity: "blocker",
    fixes: [
      "confirm the developer account is an organisation, not an individual",
      "list the licences or the regulated partner that handles exchange, and name them in the review notes",
      "remove any token reward for downloading, installing or posting about the app",
    ],
    reply: "The app is published by {{entity}}. Exchange and payout are handled by {{partner}}, which is licensed in {{where}}. The app does not reward downloads or installs.",
  },
  {
    id: "apple-4.2-minimum", store: "apple", code: "4.2", title: "minimum functionality",
    match: [/4\.2(\.\d+)?\b/i, /minimum functionality/i, /repackaged website/i],
    meaning: "the reviewer sees a thin wrapper around a website, not an app.",
    severity: "blocker",
    fixes: [
      "list the native features in use (notifications, biometrics, offline, camera) and show them in the review notes",
      "remove screens that are just a web view of the marketing site",
    ],
    reply: "The app uses {{native}} natively. A walk-through is attached.",
  },
  {
    id: "apple-5.1.1v-delete", store: "apple", code: "5.1.1(v)", title: "account deletion",
    match: [/5\.1\.1\s*\(v\)/i, /account deletion/i, /delete (their|the) account/i],
    meaning: "users who can create an account must be able to delete it from inside the app.",
    severity: "blocker",
    fixes: [
      "add a delete account control in settings, two taps at most",
      "make it delete server data, not just sign out",
      "write the path in the review notes",
    ],
    reply: "Account deletion is in Settings > {{path}}. It removes the account and its server data.",
  },
  {
    id: "apple-5.1.1-data", store: "apple", code: "5.1.1", title: "data collection and storage",
    match: [/5\.1\.1\b/i, /data collection/i, /privacy policy/i, /purpose string/i],
    meaning: "the app asks for data or a permission without saying why, or the privacy policy is missing or vague.",
    severity: "blocker",
    fixes: [
      "rewrite every permission purpose string to say exactly what the data is used for",
      "make sure the privacy policy url loads and names every data type the app collects",
      "do not ask for a permission until the feature that needs it is opened",
    ],
    reply: "We have updated the purpose strings and the privacy policy at {{url}} to state what each piece of data is used for.",
  },
  {
    id: "apple-4.8-siwa", store: "apple", code: "4.8", title: "login services",
    match: [/4\.8\b/i, /sign in with apple/i, /login services/i],
    meaning: "the app offers a third-party login, so it must also offer an equivalent privacy-friendly option.",
    severity: "blocker",
    fixes: ["add sign in with apple, or another login that limits data to name and email", "test it from a fresh install"],
    reply: "Build {{build}} adds {{option}} alongside the existing sign-in options.",
  },

  // ---------------- google play ----------------
  {
    id: "play-app-access", store: "play", code: "app access", title: "login credentials missing",
    match: [/login credentials (are )?missing/i, /app access/i, /(couldn'?t|could not|unable to) (sign|log) ?in/i, /provide (valid )?(login|sign-in) (credentials|details)/i],
    meaning: "the reviewer could not get into the app. play needs working credentials and steps in app access.",
    severity: "blocker",
    fixes: [
      "open play console > app content > app access and choose 'all or some functionality is restricted'",
      "give a reviewer account that never expires, no otp, no biometric",
      "if sign-in uses passkeys or a device pin, add numbered steps that work on a fresh emulator",
      "check the steps fit the field limit and test them yourself on a clean device",
      "send the same build for review again",
    ],
    reply: "We have updated App access with a reviewer account ({{demo_user}}) and step-by-step sign-in instructions that need no one-time code or biometric.",
  },
  {
    id: "play-financial", store: "play", code: "financial features", title: "financial features declaration",
    match: [/financial features/i, /financial services polic/i, /personal loan/i],
    meaning: "the financial features declaration is missing or does not match what the app does.",
    severity: "blocker",
    fixes: [
      "fill app content > financial features and tick every feature the app has",
      "attach licence documents or the partner agreement for regulated features",
      "make sure the store listing and the app match the declaration",
    ],
    reply: "We have completed the financial features declaration: {{features}}. Regulated features are provided by {{partner}}.",
  },
  {
    id: "play-data-safety", store: "play", code: "data safety", title: "data safety form",
    match: [/data safety/i, /user data polic/i, /prominent disclosure/i],
    meaning: "the data safety form does not match what the app collects, or a sensitive permission has no in-app disclosure.",
    severity: "blocker",
    fixes: [
      "list every sdk in the build and the data each one sends",
      "update the data safety form to match, including third-party sdks",
      "add an in-app disclosure screen before any sensitive permission prompt",
    ],
    reply: "We have updated the Data safety form to cover {{data}}, and added an in-app disclosure before {{permission}} is requested.",
  },
  {
    id: "play-permissions", store: "play", code: "permissions", title: "sensitive permissions",
    match: [/(sms|call log|contacts|all files access|query_all_packages|accessibility).{0,40}permission/i, /permissions polic/i],
    meaning: "the app asks for a restricted permission without a core use that play accepts.",
    severity: "blocker",
    fixes: [
      "remove the permission from the manifest, including ones added by libraries (check the merged manifest)",
      "if it is core, fill the permissions declaration form with a video of the feature",
    ],
    reply: "We have removed {{permission}} from build {{build}}.",
  },
  {
    id: "play-target-api", store: "play", code: "target api", title: "target api level",
    match: [/target api level/i, /targetsdk/i],
    meaning: "the build targets an android version older than play currently accepts.",
    severity: "blocker",
    fixes: ["raise targetSdkVersion to the current requirement", "re-test runtime permissions and background limits on that version"],
    reply: "Build {{build}} targets API level {{api}}.",
  },
  {
    id: "play-deceptive", store: "play", code: "deceptive behaviour", title: "misleading claims",
    match: [/deceptive behavio/i, /misleading claims/i, /impersonat/i],
    meaning: "the listing or app makes a claim play reads as misleading, or looks like another brand.",
    severity: "blocker",
    fixes: ["remove superlatives and promises the app cannot back", "remove third-party names and logos you have no rights to"],
    reply: "We have removed {{claim}} from the listing and the app.",
  },

  // ---------------- solana dapp store ----------------
  {
    id: "seeker-leg-001", store: "solana", code: "LEG-001", title: "publisher website",
    match: [/LEG-001/i, /publisher website/i],
    meaning: "the publisher website on file does not load or does not show the publisher.",
    severity: "blocker",
    fixes: ["set the publisher website to a url that returns 200 and names the company", "create a new submission, a rejected release can't be edited"],
    reply: "We have updated the publisher website to {{url}} and created a new submission.",
  },
];

export const byId = (id) => GUIDELINES.find((g) => g.id === id);
