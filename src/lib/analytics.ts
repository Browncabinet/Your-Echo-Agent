export async function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.functions.invoke("track-event", {
      body: { event_name: eventName, properties: properties ?? {} },
    });
  } catch {
    // Silently fail — analytics should never break the user flow
  }
}
