/** Where the request goes. Both speak TypeSafe's native request/response shape. */
export type ProviderId = "typesafe" | "vercel";

export type Provider = {
  id: ProviderId;
  label: string;
  /** Full URL of the systemone endpoint. */
  url: string;
  /** Model id this provider expects in the `model` field. */
  model: string;
  /** Where to get a key. */
  keysUrl: string;
  keyPlaceholder: string;
  docsUrl: string;
};

export const PROVIDERS: Record<ProviderId, Provider> = {
  typesafe: {
    id: "typesafe",
    label: "TypeSafe",
    url: "https://api.typesafe.ai/v1/systemone",
    model: "jev-latest",
    keysUrl: "https://console.typesafe.ai/keys",
    keyPlaceholder: "TypeSafe API key",
    docsUrl: "https://docs.typesafe.ai/api",
  },
  vercel: {
    id: "vercel",
    label: "Vercel AI Gateway",
    url: "https://ai-gateway.vercel.sh/typesafe/v1/systemone",
    model: "typesafe-ai/jev",
    keysUrl: "https://vercel.com/d?to=%2F%5Bteam%5D%2F~%2Fai%2Fapi-keys",
    keyPlaceholder: "AI Gateway API key",
    docsUrl: "https://vercel.com/docs/ai-gateway/sdks-and-apis/typesafe",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

export function isProviderId(v: unknown): v is ProviderId {
  return typeof v === "string" && v in PROVIDERS;
}
