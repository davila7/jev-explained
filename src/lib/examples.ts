import type { Example, NoulAnswer, ChoiceAnswer, ScoreAnswer } from "./types";

const emailSpamClassifier: Example = {
  id: "email-spam-classifier",
  title: "Email Spam Classifier",
  category: "classification",
  description:
    "One call, three typed questions. Jev returns probabilities; your code decides.",
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
        false:
          "Legitimate personal or business correspondence the recipient would expect",
      },
    },
    folder: {
      type: "choice",
      instructions: "Which folder should this email be filed in?",
      criteria: {
        inbox: "Legitimate mail the user should read",
        promotions:
          "Marketing or newsletters from a real sender the user likely opted into",
        spam: "Unsolicited junk, scams or phishing",
      },
    },
    suspicion: {
      type: "score",
      instructions:
        "How suspicious are the sender, links and language of this email?",
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

const bullish = {
  ticker: "NVDA",
  as_of: "2026-09-18T20:00:00Z",
  price: {
    last: 212.4,
    change_1d_pct: 4.8,
    change_30d_pct: 11.2,
    vs_52w_high_pct: -1.5,
  },
  valuation: { pe_forward: 31.2, pe_5y_avg: 45.0, peg: 0.9 },
  latest_quarter: {
    revenue_usd_b: 58.1,
    revenue_yoy_pct: 62,
    data_center_yoy_pct: 71,
    gross_margin_pct: 75.3,
    guidance: "Next-quarter revenue guided 9% above consensus.",
  },
  analysts: { buy: 48, hold: 6, sell: 1, avg_target: 245 },
  headlines: [
    "NVIDIA beats on revenue and raises full-year outlook",
    "Hyperscalers confirm 2027 capex plans up 30% YoY",
    "Blackwell Ultra shipments ahead of schedule",
  ],
  macro: { fed_rate_pct: 3.75, ten_year_yield_pct: 3.9, vix: 14.1 },
};

const bearish = {
  ticker: "NVDA",
  as_of: "2026-09-18T20:00:00Z",
  price: {
    last: 168.9,
    change_1d_pct: -9.6,
    change_30d_pct: -18.4,
    vs_52w_high_pct: -27.0,
  },
  valuation: { pe_forward: 38.5, pe_5y_avg: 45.0, peg: 1.6 },
  latest_quarter: {
    revenue_usd_b: 49.2,
    revenue_yoy_pct: 18,
    data_center_yoy_pct: 15,
    gross_margin_pct: 68.1,
    guidance:
      "Next-quarter revenue guided 12% below consensus citing export restrictions.",
  },
  analysts: { buy: 31, hold: 19, sell: 5, avg_target: 190 },
  headlines: [
    "New US export controls block China data-center GPU sales",
    "Top cloud customer signals shift to in-house accelerators",
    "NVIDIA cuts guidance; shares fall in after-hours trading",
  ],
  macro: { fed_rate_pct: 4.5, ten_year_yield_pct: 4.7, vix: 28.3 },
};

const mixed = {
  ticker: "NVDA",
  as_of: "2026-09-18T20:00:00Z",
  price: {
    last: 189.7,
    change_1d_pct: 0.6,
    change_30d_pct: -3.1,
    vs_52w_high_pct: -12.0,
  },
  valuation: { pe_forward: 34.0, pe_5y_avg: 45.0, peg: 1.2 },
  latest_quarter: {
    revenue_usd_b: 53.4,
    revenue_yoy_pct: 39,
    data_center_yoy_pct: 44,
    gross_margin_pct: 72.0,
    guidance: "Next-quarter revenue guided in line with consensus.",
  },
  analysts: { buy: 40, hold: 12, sell: 3, avg_target: 215 },
  headlines: [
    "NVIDIA meets estimates; guidance in line",
    "Antitrust regulators open inquiry into GPU bundling practices",
    "Rivals ship competitive inference chips at lower price points",
  ],
  macro: { fed_rate_pct: 4.0, ten_year_yield_pct: 4.2, vix: 19.8 },
};

const json = (v: unknown) => JSON.stringify(v, null, 2);

const nvidiaTrade: Example = {
  id: "nvidia-buy-or-sell",
  title: "NVIDIA: Buy or Sell?",
  category: "decision",
  description:
    "Structured market data in, a typed trading signal out. Jev reads the JSON state directly; confidence decides whether code acts or a human reviews.",
  state: json(bullish),
  questions: {
    action: {
      type: "choice",
      instructions:
        "Based only on this market snapshot, what should a long-term investor do with NVDA today?",
      criteria: {
        buy: "Fundamentals and momentum are strong and valuation is reasonable relative to growth",
        hold: "Signals are mixed or already priced in; no clear edge either way",
        sell: "Deteriorating fundamentals, guidance cuts, or material new risks outweigh the upside",
      },
    },
    sentiment: {
      type: "score",
      instructions: "How would the market read this snapshot?",
      criteria: [
        "Strongly bearish",
        "Bearish",
        "Neutral",
        "Bullish",
        "Strongly bullish",
      ],
    },
    material_risk: {
      type: "noul",
      instructions:
        "Is there a material, company-specific risk event in this snapshot (regulatory, customer loss, guidance cut)?",
      criteria: {
        true: "A concrete new risk that could change the investment thesis",
        false: "Only ordinary market noise or generic macro conditions",
      },
    },
  },
  samples: [
    { label: "Beat & raise", state: json(bullish) },
    { label: "Guidance cut", state: json(bearish) },
    { label: "Mixed", state: json(mixed) },
  ],
  decide: (answers) => {
    const action = answers.action as ChoiceAnswer | undefined;
    const sentiment = answers.sentiment as ScoreAnswer | undefined;
    const risk = answers.material_risk as NoulAnswer | undefined;
    if (!action || !sentiment || !risk) {
      return { label: "No decision", detail: "Missing answers.", tone: "warn" };
    }
    const p = (action.probabilities[action.choice] ?? 0).toFixed(2);
    // Risk first: a concrete risk event overrides an uncertain action signal.
    if (
      risk.noul >= 0.7 ||
      (action.choice === "sell" && action.confidence >= 0.6)
    ) {
      return {
        label: "Sell / reduce exposure",
        detail: `material_risk=${risk.noul.toFixed(2)}, P(${action.choice})=${p}, sentiment ${sentiment.score.toFixed(1)}/4 → trim position and flag for review.`,
        tone: "bad",
      };
    }
    if (action.confidence < 0.6) {
      return {
        label: "Hold · escalate to analyst",
        detail: `action confidence ${action.confidence.toFixed(2)} < 0.60 → too uncertain to trade automatically.`,
        tone: "warn",
      };
    }
    if (action.choice === "buy" && risk.noul < 0.4) {
      return {
        label: "Buy signal",
        detail: `P(buy)=${p}, material_risk=${risk.noul.toFixed(2)}, sentiment ${sentiment.score.toFixed(1)}/4 → open position within risk limits.`,
        tone: "ok",
      };
    }
    return {
      label: "Hold",
      detail: `P(${action.choice})=${p}, material_risk=${risk.noul.toFixed(2)} → no trade; re-evaluate next snapshot.`,
      tone: "warn",
    };
  },
};

export const EXAMPLES: Example[] = [emailSpamClassifier, nvidiaTrade];
