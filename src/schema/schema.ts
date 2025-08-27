import { z } from "zod";

// Main restaurant/inspection row schema
export const restaurantRawSchema = z.object({
	camis: z.string(),
	dba: z.string(),
	boro: z.string(),
	building: z.string().optional(),
	street: z.string(),
	zipcode: z.string().optional(),
	phone: z.string().optional(),
	cuisine_description: z.string().optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
	community_board: z.string().optional(),
	council_district: z.string().optional(),
	census_tract: z.string().optional(),
	bin: z.string().optional(),
	bbl: z.string().optional(),
	nta: z.string().optional(),
	inspection_date: z.string(),
	action: z.string().optional(),
	violation_code: z.string().optional(),
	violation_description: z.string().optional(),
	critical_flag: z.string().optional(),
	score: z.preprocess(
		(val) => (val === undefined ? undefined : Number(val)),
		z.number().optional(),
	),
	grade: z.string().optional(),
	grade_date: z.string().optional(),
	inspection_type: z.string().optional(),
});

// Search params schema, matches Socrata API param names
export const restaurantSearchParamsSchema = z.object({
	score: z.number().min(0).max(100).optional(),
	grade: z.string().optional(),
	inspection_date: z.string().optional(),
	zipcode: z.number().max(99999).optional(),
	critical_flag: z.string().optional(),
	dba: z.string().optional(),
	camis: z.string().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	boro: z.string().optional(),
	zoom: z.number().min(0).max(22).optional(),
	$group: z.string().optional(),
	$limit: z.number().max(10000).default(2500).optional(),
	$offset: z.number().default(0).optional(),
	$q: z.string().optional(),
	$order: z.string().default("inspection_date DESC").optional(),
	$where: z.string().optional(),
});

// API response schema: always an array of restaurant objects
export const restaurantApiResponseSchema = z.array(restaurantRawSchema);

export type RestaurantSearchParams = z.infer<
	typeof restaurantSearchParamsSchema
>;
export type RestaurantRaw = z.infer<typeof restaurantRawSchema>;
