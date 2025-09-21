import type { Restaurant } from "@/types/restaurant";

// Returns { data, topCuisines }
// data: Array<{ year: string, [cuisine]: number }>
export function aggregateCuisineTrends(restaurants: Restaurant[], topN = 6) {
	const countsByCuisineYear: Record<string, Record<string, number>> = {};
	const cuisineTotals: Record<string, number> = {};

	for (const r of restaurants) {
		const cuisine = r.cuisine_description ?? "Unknown";
		if (!Array.isArray(r.inspections) || r.inspections.length === 0) continue;
		for (const insp of r.inspections) {
			const date = insp?.inspection_date;
			if (!date) continue;
			const year = String(date).slice(0, 4);
			if (!year.match(/^\d{4}$/)) continue;
			countsByCuisineYear[year] ??= {};
			countsByCuisineYear[year][cuisine] =
				(countsByCuisineYear[year][cuisine] ?? 0) + 1;
			cuisineTotals[cuisine] = (cuisineTotals[cuisine] ?? 0) + 1;
		}
	}

	// Determine top cuisines by total inspections
	const topCuisines = Object.entries(cuisineTotals)
		.sort((a, b) => b[1] - a[1])
		.slice(0, topN)
		.map((e) => e[0]);

	// Build sorted year list
	const years = Object.keys(countsByCuisineYear).sort();

	// Build data array shaped for the area chart
	const data = years.map((year) => {
		const row: Record<string, string | number> = { year };
		for (const cuisine of topCuisines) {
			row[cuisine] = countsByCuisineYear[year][cuisine] ?? 0;
		}
		return row;
	});

	return { data, topCuisines } as const;
}

export function safeExtractRestaurants(payload: unknown): Restaurant[] {
	if (!payload || typeof payload !== "object") return [];
	const p = payload as { restaurants?: unknown };
	if (!Array.isArray(p.restaurants)) return [];
	return p.restaurants as Restaurant[];
}
