import type { RestaurantSearchParams } from "@/schema/schema";

// Keys that are client-only and must not be forwarded to Socrata. NOTE:
// We keep `zoom` in the normalized object so it becomes part of the
// React Query key (different zooms should cache separately). The
// server-side `getRestaurantsFn` will still strip `zoom` before calling
// Socrata, so keeping it here only affects cache-keying.
const INTERNAL_KEYS = ["latitude", "longitude", "markerOnly"];

function stripQuotes(v: unknown) {
	if (v === undefined || v === null) return undefined;
	return String(v)
		.trim()
		.replace(/^"+|"+$/g, "");
}

function parseNum(v: unknown) {
	const s = stripQuotes(v);
	if (s === undefined) return undefined;
	const n = Number(s);
	return Number.isFinite(n) ? n : undefined;
}

export function normalizeParams(raw?: Record<string, unknown>) {
	const inObj = (raw ?? {}) as Record<string, unknown>;
	const out: Record<string, unknown> = {};

	// copy, strip quotes for strings
	for (const [k, v] of Object.entries(inObj)) {
		if (v === undefined || v === null) continue;
		if (typeof v === "string") out[k] = stripQuotes(v);
		else out[k] = v;
	}

	// coercions / defaults
	if (out.zoom === undefined) out.zoom = 12;
	if (out.markerOnly === undefined) out.markerOnly = "1";

	// If bbox numeric strings exist, coerce them to numbers for deterministic keys
	const minLat = parseNum(out.minLat);
	const maxLat = parseNum(out.maxLat);
	const minLng = parseNum(out.minLng);
	const maxLng = parseNum(out.maxLng);
	if (minLat !== undefined) out.minLat = minLat;
	if (maxLat !== undefined) out.maxLat = maxLat;
	if (minLng !== undefined) out.minLng = minLng;
	if (maxLng !== undefined) out.maxLng = maxLng;

	// Remove internal-only keys from the canonical object used as queryKey
	for (const k of INTERNAL_KEYS) {
		if (k in out) delete out[k];
	}

	// Return a new object with sorted keys for deterministic ordering
	const sorted: Record<string, unknown> = {};
	for (const k of Object.keys(out).sort()) sorted[k] = out[k];

	return sorted as unknown as RestaurantSearchParams;
}

export default normalizeParams;
