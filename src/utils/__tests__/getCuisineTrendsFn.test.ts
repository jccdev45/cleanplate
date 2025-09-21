import { describe, expect, it, vi } from "vitest";

// Mock retryFetch to return a Response-like object
vi.mock("@/lib/fetch-utils", () => {
	return {
		parseNum: (v: unknown) => {
			if (v === undefined || v === null) return undefined;
			const n = Number(String(v));
			return Number.isFinite(n) ? n : undefined;
		},
		retryFetch: vi.fn(async () => {
			return {
				ok: true,
				json: async () => [
					{ year: "2022", cuisine_description: "Italian", cnt: "10" },
					{ year: "2023", cuisine_description: "Italian", cnt: "12" },
					{ year: "2022", cuisine_description: "Mexican", cnt: "5" },
					{ year: "2023", cuisine_description: "Mexican", cnt: "7" },
				],
			};
		}),
		sanitizeSnippet: (s: string) => s,
		stripQuotes: (s: unknown) => (typeof s === "string" ? s : s),
	};
});

vi.mock("@/lib/posthog", () => ({ sendPosthogEvent: vi.fn() }));

import { getCuisineTrendsFn } from "@/utils/restaurant";

describe("getCuisineTrendsFn", () => {
	it("aggregates socrata rows into year x cuisine buckets and top cuisines", async () => {
		type TrendsResult = {
			data: Array<Record<string, string | number>>;
			topCuisines: string[];
		};
		const fn = getCuisineTrendsFn as unknown as (args: {
			data?: { topN?: number };
		}) => Promise<TrendsResult>;
		const res = await fn({ data: { topN: 2 } });
		expect(res).toHaveProperty("data");
		expect(res).toHaveProperty("topCuisines");
		const { data, topCuisines } = res;
		// topCuisines should include Italian and Mexican in some order
		expect(topCuisines.length).toBe(2);
		// data should be an array of rows with year and cuisine counts
		expect(Array.isArray(data)).toBe(true);
		// find 2022 row
		const row2022 = data.find((r) => String(r.year) === "2022");
		expect(row2022).toBeTruthy();
		expect(row2022).toBeDefined();
		if (row2022) {
			expect(Number(row2022.Italian)).toBe(10);
			expect(Number(row2022.Mexican)).toBe(5);
		}
	});
});
