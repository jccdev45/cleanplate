// Small reusable fetch and string helpers used by server code

export function stripQuotes(v: unknown): string | undefined {
	if (v === undefined || v === null) return undefined;
	const s = String(v).trim();
	const out = s.replace(/^"+|"+$/g, "");
	return out === "" ? "" : out;
}

export function parseNum(v: unknown): number | undefined {
	if (v === undefined || v === null) return undefined;
	const s = stripQuotes(v);
	if (s === undefined || s === "") return undefined;
	const n = Number(s);
	return Number.isFinite(n) ? n : undefined;
}

export function sanitizeSnippet(raw: unknown, maxLen = 1000): string {
	const s = String(raw ?? "").slice(0, maxLen);
	return s
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export async function retryFetch(
	input: RequestInfo | URL,
	init: RequestInit | undefined,
	maxRetries = 3,
	baseDelayMs = 500,
): Promise<Response> {
	let last: Response | null = null;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		const res = await fetch(input, init);
		last = res;
		if (res.ok) return res;
		if (res.status >= 500 && attempt < maxRetries) {
			const backoff = baseDelayMs * 2 ** (attempt - 1);
			await new Promise((r) => setTimeout(r, backoff));
			continue;
		}
		break;
	}
	if (last) return last;
	throw new Error("fetch failed: no response");
}
