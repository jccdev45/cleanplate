import type { RestaurantSearchParams } from "@/schema/schema";
import {
	aggregateCuisineTrends,
	safeExtractRestaurants,
} from "@/utils/aggregate-inspections";
import {
	getBoroughCountsFn,
	getCriticalFlagDistributionFn,
	getCuisineCountsFn,
	getCuisineTrendsFn,
	getDashboardStatsFn,
	getGradeDistributionFn,
	getRestaurantsFn,
	getScoreHistogramFn,
} from "@/utils/restaurant";
import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";

const HOUR_IN_MS = 1000 * 60 * 60;

export const restaurantQueries = {
	list: (params?: RestaurantSearchParams) =>
		queryOptions({
			queryKey: ["restaurants", params],
			queryFn: () => getRestaurantsFn({ data: params }),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
			placeholderData: keepPreviousData,
		}),

	infiniteList: (params?: Omit<RestaurantSearchParams, "$offset">) =>
		infiniteQueryOptions({
			queryKey: ["restaurants", "infinite", params],
			queryFn: ({ pageParam }) => {
				const callerLimit = (params as Record<string, unknown>)?.$limit;
				const parsedLimit =
					typeof callerLimit === "number"
						? callerLimit
						: typeof callerLimit === "string"
							? Number(callerLimit)
							: undefined;
				const defaultLimit = 1000;
				const finalLimit = Math.min(
					1000,
					Math.max(100, parsedLimit ?? defaultLimit),
				);
				return getRestaurantsFn({
					data: { ...params, $offset: pageParam, $limit: finalLimit },
				});
			},
			initialPageParam: 0,
			getNextPageParam: (lastPage) => lastPage.nextOffset,
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
			placeholderData: keepPreviousData,
		}),

	detail: (camis: string) =>
		queryOptions({
			queryKey: ["restaurants", "detail", camis],
			queryFn: () => getRestaurantsFn({ data: { camis } }),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	cuisineCounts: (opts?: {
		topN?: number;
		minYear?: number;
		maxYear?: number;
	}) =>
		queryOptions({
			queryKey: ["charts", "cuisineCounts", opts],
			queryFn: async () => {
				// Prefer server-side aggregation; fallback to client aggregation
				try {
					const res = (await getCuisineCountsFn({
						data: {
							topN: opts?.topN,
							minYear: opts?.minYear,
							maxYear: opts?.maxYear,
						},
					})) as unknown;
					// validate shape
					// validate shape
					if (
						res &&
						typeof res === "object" &&
						Array.isArray((res as Record<string, unknown>).data)
					) {
						return res;
					}
				} catch (err) {
					// fallthrough to client-side aggregation
				}

				// fallback: fetch markers and aggregate client-side
				const optsRecord = opts as Record<string, unknown> | undefined;
				const fallbackLimit = (optsRecord?.$limit as number) ?? 10000;
				const list = await getRestaurantsFn({
					data: { markerOnly: true, $limit: fallbackLimit },
				});
				const restaurants = safeExtractRestaurants(list);
				// produce counts by cuisine
				const totals: Record<string, number> = {};
				for (const r of restaurants) {
					const cuisine = r.cuisine_description ?? "Unknown";
					totals[cuisine] = (totals[cuisine] ?? 0) + 1;
				}
				const sorted = Object.entries(totals)
					.map(([cuisine, count]) => ({ cuisine, count }))
					.sort((a, b) => b.count - a.count);
				const end =
					typeof opts?.topN === "number" && opts.topN > 0
						? opts.topN
						: undefined;
				const data = end ? sorted.slice(0, end) : sorted;

				return { data };
			},
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	trendsList: (opts?: { $limit?: number }) =>
		queryOptions({
			queryKey: ["charts", "trendsList", opts],
			queryFn: () =>
				getRestaurantsFn({ data: { $limit: opts?.$limit ?? 10000 } }),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	trendsAggregate: (opts?: {
		topNumber?: number;
		minYear?: number;
		maxYear?: number;
	}) =>
		queryOptions({
			queryKey: ["charts", "trendsAggregate", opts],
			queryFn: async () => {
				// Normalize param name expected by server fn (topN)
				const serverArgs = {
					topN: opts?.topNumber,
					minYear: opts?.minYear,
					maxYear: opts?.maxYear,
				};
				try {
					const res = (await getCuisineTrendsFn({
						data: serverArgs,
					})) as unknown;
					function isValidServerShape(v: unknown): v is {
						data: Array<Record<string, string | number>>;
						topCuisines: string[];
					} {
						if (v === null || typeof v !== "object") return false;
						const obj = v as Record<string, unknown>;
						if (!("data" in obj) || !("topCuisines" in obj)) return false;
						if (!Array.isArray(obj.data)) return false;
						if (!Array.isArray(obj.topCuisines)) return false;
						return true;
					}
					if (!isValidServerShape(res) || res.data.length <= 1) {
						const list = await getRestaurantsFn({
							data: { markerOnly: true, $limit: 10000 },
						});
						const restaurants = safeExtractRestaurants(list);
						return aggregateCuisineTrends(restaurants, opts?.topNumber ?? 6);
					}
					return res;
				} catch (err) {
					const list = await getRestaurantsFn({
						data: { markerOnly: true, $limit: 10000 },
					});
					const restaurants = safeExtractRestaurants(list);
					return aggregateCuisineTrends(restaurants, opts?.topNumber ?? 6);
				}
			},
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	boroughCounts: (opts?: { minYear?: number; maxYear?: number }) => ({
		queryKey: ["boroughCounts", opts?.minYear, opts?.maxYear] as const,
		queryFn: async () => {
			try {
				const serverRes = await getBoroughCountsFn({
					data: { minYear: opts?.minYear, maxYear: opts?.maxYear },
				});
				const serverCast = serverRes as unknown as Record<string, unknown>;
				if (serverRes && Array.isArray(serverCast.data))
					return serverRes as unknown as { data: unknown[] };
			} catch (err) {
				// fallback
			}
			const list = await getRestaurantsFn({
				data: { markerOnly: true, $limit: 10000 },
			});
			const restaurants = safeExtractRestaurants(list);
			// aggregate client-side by boro
			const map = new Map<string, number>();
			for (const r of restaurants) {
				const key = (r.boro || "Unknown") as string;
				map.set(key, (map.get(key) ?? 0) + 1);
			}
			const out = Array.from(map.entries()).map(([boro, count]) => ({
				boro,
				count,
			}));
			out.sort((a, b) => b.count - a.count);
			return { data: out } as const;
		},
	}),

	gradeDistribution: (opts?: { minYear?: number; maxYear?: number }) => ({
		queryKey: ["gradeDistribution", opts?.minYear, opts?.maxYear] as const,
		queryFn: async () => {
			try {
				const serverRes = await getGradeDistributionFn({
					data: { minYear: opts?.minYear, maxYear: opts?.maxYear },
				});
				const serverCast = serverRes as unknown as Record<string, unknown>;
				if (serverRes && Array.isArray(serverCast.data))
					return serverRes as unknown as { data: unknown[] };
			} catch (err) {
				// fallback
			}
			const list = await getRestaurantsFn({
				data: { markerOnly: true, $limit: 10000 },
			});
			const restaurants = safeExtractRestaurants(list);
			const map = new Map<string, number>();
			for (const r of restaurants) {
				const key = (r.inspections?.[0]?.grade || "N/A") as string;
				map.set(key, (map.get(key) ?? 0) + 1);
			}
			const out = Array.from(map.entries()).map(([grade, count]) => ({
				grade,
				count,
			}));
			out.sort((a, b) => (a.grade > b.grade ? 1 : -1));
			return { data: out } as const;
		},
	}),

	criticalFlagDistribution: (opts?: {
		minYear?: number;
		maxYear?: number;
	}) => ({
		queryKey: [
			"criticalFlagDistribution",
			opts?.minYear,
			opts?.maxYear,
		] as const,
		queryFn: async () => {
			try {
				const serverRes = await getCriticalFlagDistributionFn({
					data: { minYear: opts?.minYear, maxYear: opts?.maxYear },
				});
				const serverCast = serverRes as unknown as Record<string, unknown>;
				if (serverRes && Array.isArray(serverCast.data))
					return serverRes as unknown as { data: unknown[] };
			} catch (err) {
				// fallback
			}
			const list = await getRestaurantsFn({
				data: { markerOnly: true, $limit: 10000 },
			});
			const restaurants = safeExtractRestaurants(list);
			const map = new Map<string, number>();
			for (const r of restaurants) {
				const key = (r.inspections?.[0]?.critical_flag ||
					"Not Applicable") as string;
				map.set(key, (map.get(key) ?? 0) + 1);
			}
			const out = Array.from(map.entries()).map(([name, value]) => ({
				name,
				value,
			}));
			out.sort((a, b) => b.value - a.value);
			return { data: out } as const;
		},
	}),

	scoreHistogram: (opts?: { minYear?: number; maxYear?: number }) => ({
		queryKey: ["scoreHistogram", opts?.minYear, opts?.maxYear] as const,
		queryFn: async () => {
			try {
				const serverRes = await getScoreHistogramFn({
					data: { minYear: opts?.minYear, maxYear: opts?.maxYear },
				});
				const serverCast = serverRes as unknown as Record<string, unknown>;
				if (serverRes && Array.isArray(serverCast.data))
					return serverRes as unknown as { data: unknown[] };
			} catch (err) {
				// fallback
			}
			const list = await getRestaurantsFn({
				data: { markerOnly: true, $limit: 10000 },
			});
			const restaurants = safeExtractRestaurants(list);
			const map = new Map<number, number>();
			for (const r of restaurants) {
				const sc = Number(r.inspections?.[0]?.score ?? 0) || 0;
				map.set(sc, (map.get(sc) ?? 0) + 1);
			}
			const out = Array.from(map.entries()).map(([score, count]) => ({
				score,
				count,
			}));
			out.sort((a, b) => a.score - b.score);
			return { data: out } as const;
		},
	}),

	dashboardStats: (opts?: { topCuisines?: number }) =>
		queryOptions({
			queryKey: ["dashboardStats", opts?.topCuisines] as const,
			queryFn: async () => {
				try {
					const res = await getDashboardStatsFn({
						data: { topCuisines: opts?.topCuisines },
					});
					const cast = res as unknown as Record<string, unknown>;
					if (cast && typeof cast === "object") return res as unknown;
				} catch (err) {
					// fallback: sample and compute
				}
				const list = await getRestaurantsFn({
					data: { markerOnly: true, $limit: 2000 },
				});
				const restaurants = safeExtractRestaurants(list);
				const totalRestaurants = new Set(restaurants.map((r) => r.camis)).size;
				const scores: number[] = [];
				const cuisineSet = new Set<string>();
				let gradeACount = 0;
				let critCount = 0;
				for (const r of restaurants) {
					cuisineSet.add(r.cuisine_description ?? "Unknown");
					const s = r.inspections?.[0]?.score;
					if (s !== undefined && s !== null && Number.isFinite(s))
						scores.push(s as number);
					const g = r.inspections?.[0]?.grade;
					if (g === "A") gradeACount += 1;
					if (r.inspections?.some((i) => i.critical_flag === "Y"))
						critCount += 1;
				}
				const avgScore = scores.length
					? scores.reduce((a, b) => a + b, 0) / scores.length
					: null;
				const pctGradeA =
					totalRestaurants > 0 ? (gradeACount / totalRestaurants) * 100 : 0;
				const topCuisines = Array.from(cuisineSet)
					.slice(0, opts?.topCuisines ?? 5)
					.map((c) => ({ cuisine: c, count: 0 }));
				return {
					totalRestaurants,
					avgScore,
					totalCuisines: cuisineSet.size,
					pctGradeA,
					topCuisines,
				} as const;
			},
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),
};
