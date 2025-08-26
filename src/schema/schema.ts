import { z } from "zod";

export const nycRawInspectionSchema = z.object({
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

export const restaurantSearchSchema = z
	.object({
		score: z.number().min(0).max(100).optional(),
		grade: z.string().optional(),
		inspection_date: z.iso.datetime().optional(),
		zipcode: z.number().max(99999).optional(),
		critical_flag: z.string().optional(),
		dba: z.string().optional(),
		camis: z.string().optional(),
		$group: z.string().optional(),
		$limit: z.number().max(10000).catch(2500).optional(),
		$offset: z.number().catch(0).optional(),
		$q: z.string().optional(),
		$order: z.string().catch("inspection_date DESC").optional(),
		$where: z.string().optional(),
	})
	.optional();

export type RestaurantSearchParams = z.infer<typeof restaurantSearchSchema>;
export type NycRawInspection = z.infer<typeof nycRawInspectionSchema>;
