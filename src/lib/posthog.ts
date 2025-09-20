// Lightweight server-side PostHog helper used by server functions.
// This module intentionally keeps the API minimal and non-blocking so
// analytics failures never affect the request flow.

const POSTHOG_SERVER_KEY =
	process.env.POSTHOG_INGEST_KEY ??
	process.env.POSTHOG_SERVER_KEY ??
	(process.env.NODE_ENV !== "production"
		? process.env.VITE_PUBLIC_POSTHOG_KEY
		: undefined);
const POSTHOG_HOST =
	process.env.POSTHOG_HOST ??
	process.env.VITE_PUBLIC_POSTHOG_HOST ??
	"https://app.posthog.com";

export async function sendPosthogEvent(
	event: string,
	properties: Record<string, unknown>,
) {
	if (!POSTHOG_SERVER_KEY) return;
	try {
		await fetch(`${POSTHOG_HOST.replace(/\/$/, "")}/capture/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ api_key: POSTHOG_SERVER_KEY, event, properties }),
		});
	} catch (_err) {
		// swallow analytics failures
	}
}

export const posthogEnabled = Boolean(POSTHOG_SERVER_KEY);
