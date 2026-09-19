import type { Example, NoulAnswer, ChoiceAnswer, ScoreAnswer } from "./types";

export const MODEL = "jev-latest";

const emailSpamClassifier: Example = {
  id: "email-spam-classifier",
  title: "Email Spam Classifier",
  category: "classification",
  description: "One call, three typed questions. Jev returns probabilities; your code decides.",
  state: `From: "Account Security" <no-reply@secure-verify-center.info>
Subject: URGENT: Your account will be suspended in 24 hours

Dear Customer,

We detected unusual sign-in activity on your account. To avoid permanent suspension you must verify your identity immediately by clicking the link below:

http://secure-verify-center.info/login?id=83921

Failure to act within 24 hours will result in loss of access. This is your final notice.

Sincerely,
Account Security Team`,
  questions: {
    is_spam: {
      type: "noul",
      instructions: "Is this email spam or a phishing attempt?",
      criteria: {
        true: "Unsolicited bulk mail, scams, phishing, or deceptive messages",
        false: "Legitimate personal or business correspondence the recipient would expect",
      },
    },
    folder: {
      type: "choice",
      instructions: "Which folder should this email be filed in?",
      criteria: {
        inbox: "Legitimate mail the user should read",
        promotions: "Marketing or newsletters from a real sender the user likely opted into",
        spam: "Unsolicited junk, scams or phishing",
      },
    },
    suspicion: {
      type: "score",
      instructions: "How suspicious are the sender, links and language of this email?",
      criteria: [
        "Nothing suspicious",
        "Mildly suspicious (odd sender or wording)",
        "Clearly suspicious (pressure tactics, unknown links)",
        "Obvious phishing or scam",
      ],
    },
  },
  samples: [
    {
      label: "Phishing",
      state: `From: "Account Security" <no-reply@secure-verify-center.info>
Subject: URGENT: Your account will be suspended in 24 hours

Dear Customer,

We detected unusual sign-in activity on your account. To avoid permanent suspension you must verify your identity immediately by clicking the link below:

http://secure-verify-center.info/login?id=83921

Failure to act within 24 hours will result in loss of access. This is your final notice.

Sincerely,
Account Security Team`,
    },
    {
      label: "Coworker",
      state: `From: Marta Ruiz <marta@acme-corp.com>
Subject: Re: Q4 roadmap review — moving to Thursday

Hi Dan,

Quick heads up: I moved our roadmap review to Thursday at 3pm so Luis can join. I attached the updated deck to the calendar invite.

Can you add the pricing experiment results to slide 7 before then?

Thanks!
Marta`,
    },
    {
      label: "Newsletter",
      state: `From: The Weekly Byte <hello@weeklybyte.dev>
Subject: 🚀 5 tools every developer should try this week

Hey there,

This week's roundup: a new terminal multiplexer, a tiny SQLite GUI, and a CLI for diffing JSON.

Read the full issue → https://weeklybyte.dev/issues/142

You're receiving this because you subscribed at weeklybyte.dev. Unsubscribe anytime.`,
    },
  ],
  decide: (answers) => {
    const spam = answers.is_spam as NoulAnswer | undefined;
    const folder = answers.folder as ChoiceAnswer | undefined;
    const suspicion = answers.suspicion as ScoreAnswer | undefined;
    if (!spam || !folder || !suspicion) {
      return { label: "No decision", detail: "Missing answers.", tone: "warn" };
    }
    if (spam.noul >= 0.8) {
      return {
        label: "Move to Spam",
        detail: `is_spam=${spam.noul.toFixed(2)} ≥ 0.80 → filed automatically, no human needed.`,
        tone: "bad",
      };
    }
    if (spam.noul > 0.3 || folder.confidence < 0.6) {
      return {
        label: "Flag for review",
        detail: `is_spam=${spam.noul.toFixed(2)} is in the gray zone (or folder confidence ${folder.confidence.toFixed(2)} < 0.60) → keep in inbox with a warning banner.`,
        tone: "warn",
      };
    }
    return {
      label: `Deliver to ${folder.choice}`,
      detail: `is_spam=${spam.noul.toFixed(2)} ≤ 0.30 and folder confidence ${folder.confidence.toFixed(2)} → deliver without friction.`,
      tone: "ok",
    };
  },
};

export const EXAMPLES: Example[] = [emailSpamClassifier];
