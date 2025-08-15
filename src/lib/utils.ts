import type { NycRawInspection } from "@/schema/schema";
import type { Restaurant, Violation } from "@/types/restaurant";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateInspectionId(
	camis: string,
	inspection_date: string,
): string {
	return `${camis}-${inspection_date}`;
}

export function groupRestaurants(data: NycRawInspection[]): Restaurant[] {
	const restaurantsMap = new Map<string, Restaurant>();

	for (const row of data) {
		// Ensure this is a valid restaurant
		if (
			!row.camis ||
			!row.inspection_date ||
			row.inspection_date === "1900-01-01T00:00:00.000"
		)
			continue;

		// Create or fetch the Restaurant object for this camis
		let restaurant = restaurantsMap.get(row.camis);
		if (!restaurant) {
			restaurant = {
				camis: row.camis,
				dba: row.dba,
				boro: row.boro,
				building: row.building,
				street: row.street,
				zipcode: row.zipcode,
				phone: row.phone,
				cuisine_description: row.cuisine_description,
				latitude: row.latitude,
				longitude: row.longitude,
				community_board: row.community_board,
				council_district: row.council_district,
				census_tract: row.census_tract,
				bin: row.bin,
				bbl: row.bbl,
				nta: row.nta,
				inspections: [],
			};
			restaurantsMap.set(row.camis, restaurant);
		}

		// Prepare violation (may be missing if the row is for a passed inspection)
		let violation: Violation | undefined = undefined;
		if (row.violation_code && row.violation_description && row.critical_flag) {
			violation = {
				violation_code: row.violation_code,
				violation_description: row.violation_description,
				critical_flag: row.critical_flag,
			};
		}

		// InspectionId: combine camis + inspection_date for uniqueness
		const inspectionId = `${row.camis}_${row.inspection_date}`;
		// Find existing inspection object for this inspection event
		let inspection = restaurant.inspections.find(
			(i) => i.inspectionId === inspectionId,
		);
		if (!inspection) {
			inspection = {
				inspectionId,
				inspection_date: row.inspection_date,
				action: row.action,
				critical_flag: row.critical_flag,
				score: row.score,
				grade: row.grade,
				grade_date: row.grade_date,
				inspection_type: row.inspection_type,
				violations: [],
			};
			restaurant.inspections.push(inspection);
		}
		// Add violation to inspection, if present and not already in list
		if (violation) {
			// (Optional: check for existing to avoid duplicates)
			inspection.violations.push(violation);
		}
	}
	return Array.from(restaurantsMap.values());
}
