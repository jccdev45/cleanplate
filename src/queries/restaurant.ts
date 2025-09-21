import type { RestaurantSearchParams } from "@/schema/schema";
import { getCuisineTrendsFn, getRestaurantsFn } from "@/utils/restaurant";
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

	cuisineCounts: (opts?: { $limit?: number }) =>
		queryOptions({
			queryKey: ["charts", "cuisineCounts", opts],
			queryFn: () =>
				getRestaurantsFn({
					data: { markerOnly: true, $limit: opts?.$limit ?? 10000 },
				}),
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

	boroughCounts: (opts?: { $limit?: number }) =>
		queryOptions({
			queryKey: ["charts", "boroughCounts", opts],
			queryFn: () =>
				getRestaurantsFn({
					data: { markerOnly: true, $limit: opts?.$limit ?? 10000 },
				}),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	gradeDistribution: (opts?: { $limit?: number }) =>
		queryOptions({
			queryKey: ["charts", "gradeDistribution", opts],
			queryFn: () =>
				getRestaurantsFn({
					data: { markerOnly: true, $limit: opts?.$limit ?? 10000 },
				}),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	criticalFlagDistribution: (opts?: { $limit?: number }) =>
		queryOptions({
			queryKey: ["charts", "criticalFlagDistribution", opts],
			queryFn: () =>
				getRestaurantsFn({
					data: { markerOnly: true, $limit: opts?.$limit ?? 10000 },
				}),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	scoreHistogram: (opts?: { $limit?: number }) =>
		queryOptions({
			queryKey: ["charts", "scoreHistogram", opts],
			queryFn: () =>
				getRestaurantsFn({
					data: { markerOnly: true, $limit: opts?.$limit ?? 10000 },
				}),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),

	trendsAggregate: (opts?: {
		topN?: number;
		minYear?: number;
		maxYear?: number;
	}) =>
		queryOptions({
			queryKey: ["charts", "trendsAggregate", opts],
			queryFn: () => getCuisineTrendsFn({ data: opts ?? {} }),
			staleTime: HOUR_IN_MS,
			gcTime: HOUR_IN_MS * 2,
			refetchOnWindowFocus: false,
		}),
};
