import { parseNum, stripQuotes } from "@/lib/fetch-utils";

/**
 * Build Socrata-friendly params from a raw params object.
 * This mirrors the logic used in the old `getRestaurantsFn` but is kept
 * here so both list and aggregation endpoints can reuse it and be unit-tested.
 */
export function buildSocrataParams(
	paramsRaw: Record<string, unknown> = {},
	opts?: { markerOnlyDefaultLimit?: number },
): Record<string, unknown> {
	const params: Record<string, unknown> = {};
	// copy + sanitize strings
	for (const [k, v] of Object.entries(paramsRaw)) {
		if (v === undefined || v === null) continue;
		if (typeof v === "string") {
			params[k] = stripQuotes(v);
		} else {
			params[k] = v;
		}
	}

	const markerVal = stripQuotes(params.markerOnly ?? paramsRaw.markerOnly);
	const markerOnly =
		markerVal === "1" ||
		(typeof markerVal === "string" && markerVal.toLowerCase() === "true") ||
		params.markerOnly === true ||
		paramsRaw.markerOnly === true;
	if (markerOnly) {
		params.$select =
			"camis,dba,latitude,longitude,grade,critical_flag,inspection_date,boro,zipcode,cuisine_description,building,street";
		if (params.$limit === undefined)
			params.$limit = opts?.markerOnlyDefaultLimit ?? 300;
	}

	// bbox handling
	const minLatN = parseNum(params.minLat ?? paramsRaw.minLat);
	const maxLatN = parseNum(params.maxLat ?? paramsRaw.maxLat);
	const minLngN = parseNum(params.minLng ?? paramsRaw.minLng);
	const maxLngN = parseNum(params.maxLng ?? paramsRaw.maxLng);
	const hasBbox =
		minLatN !== undefined &&
		maxLatN !== undefined &&
		minLngN !== undefined &&
		maxLngN !== undefined;
	if (hasBbox) {
		params.$where = `latitude >= ${minLatN} AND latitude <= ${maxLatN} AND longitude >= ${minLngN} AND longitude <= ${maxLngN}`;
		params.minLat = minLatN;
		params.maxLat = maxLatN;
		params.minLng = minLngN;
		params.maxLng = maxLngN;
	}

	// sentinel exclusion for oldest-first inspection_date sorts
	const orderVal = String(
		params.$order ?? paramsRaw.$order ?? "",
	).toLowerCase();
	if (orderVal.includes("inspection_date") && orderVal.includes("asc")) {
		const sentinelCond = "inspection_date > '1900-01-01T00:00:00.000'";
		if (params.$where) {
			params.$where = `(${String(params.$where)}) AND ${sentinelCond}`;
		} else {
			params.$where = sentinelCond;
		}
	}

	// remove internal-only keys
	const INTERNAL_KEYS = [
		"minLat",
		"maxLat",
		"minLng",
		"maxLng",
		"markerOnly",
		"latitude",
		"longitude",
		"zoom",
	];
	for (const k of INTERNAL_KEYS) {
		if (k in params) delete params[k];
	}

	return params;
}

export function buildSocrataUrl(
	baseUrl: string,
	paramsRaw: Record<string, unknown> = {},
	opts?: { markerOnlyDefaultLimit?: number },
) {
	const params = buildSocrataParams(paramsRaw, opts);
	const url = new URL(baseUrl);
	const entries: [string, string][] = [];
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue;
		entries.push([key, String(value)]);
	}
	if (entries.length) url.search = new URLSearchParams(entries).toString();
	return url.toString();
}
