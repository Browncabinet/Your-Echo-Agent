import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

declare global {
  interface Window {
    Paddle: any;
  }
}

export type PaddleEnv = "sandbox" | "live";

export function getPaddleEnvironment(): PaddleEnv {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;
let paddleInitPromise: Promise<void> | null = null;

export async function initializePaddle(): Promise<void> {
  if (paddleInitialized) return;
  if (paddleInitPromise) return paddleInitPromise;
  if (!clientToken) throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");

  paddleInitPromise = new Promise<void>((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      setupPaddle();
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      setupPaddle();
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.head.appendChild(script);
  });
  return paddleInitPromise;

  function setupPaddle() {
    const jsEnv = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
    window.Paddle.Environment.set(jsEnv);
    window.Paddle.Initialize({ token: clientToken });
    paddleInitialized = true;
  }
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment: getPaddleEnvironment() },
  });
  if (error || !data?.paddleId) {
    throw new Error(`Failed to resolve price: ${priceId}`);
  }
  return data.paddleId;
}
