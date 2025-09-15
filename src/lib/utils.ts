import type { RestaurantRaw } from "@/schema/schema";
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

export function groupRestaurants(data: RestaurantRaw[]): Restaurant[] {
	const restaurantsMap = new Map<string, Restaurant>();

	for (const row of data) {
		// Ensure this is a valid restaurant. Require camis, but allow missing
		// inspection_date for marker-only responses (we'll synthesize a fallback).
		if (!row.camis) continue;

		// Create or fetch the Restaurant object for this camis
		let restaurant = restaurantsMap.get(row.camis);
		if (!restaurant) {
			restaurant = {
				camis: row.camis,
				dba: row.dba,
				boro: row.boro,
				building: row.building,
				street: row.street,
				address:
					typeof (row as Record<string, unknown>).address === "string"
						? ((row as unknown as Record<string, string>).address as string)
						: row.building && row.street
							? `${row.building} ${row.street}`
							: undefined,
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

		// InspectionId: combine camis + inspection_date for uniqueness. Some
		// marker-only responses omit inspection_date, so fall back to grade_date
		// or an empty string to ensure we still create a marker entry.
		const inspectionDateKey = row.inspection_date ?? row.grade_date ?? "";
		const inspectionId = `${row.camis}_${inspectionDateKey}`;
		// Find existing inspection object for this inspection event
		let inspection = restaurant.inspections.find(
			(i) => i.inspectionId === inspectionId,
		);
		if (!inspection) {
			inspection = {
				inspectionId,
				inspection_date: row.inspection_date ?? row.grade_date ?? "",
				action: row.action,
				critical_flag: row.critical_flag,
				score: row.score,
				grade: row.grade,
				grade_date: row.grade_date,
				inspection_type: row.inspection_type,
				violations: [],
			};
			restaurant.inspections.push(inspection);
		} else {
			// If the inspection object already exists (multiple rows for the
			// same inspection), merge any missing/undefined fields from the
			// current row. Socrata often returns one row per violation which
			// can cause grade/critical_flag to appear on different rows.
			// Ensure we don't lose data depending on row order by filling in
			// fields that are currently undefined.
			inspection.action = inspection.action ?? row.action;
			inspection.critical_flag = inspection.critical_flag ?? row.critical_flag;
			inspection.score = inspection.score ?? row.score;
			inspection.grade = inspection.grade ?? row.grade;
			inspection.grade_date = inspection.grade_date ?? row.grade_date;
			inspection.inspection_type =
				inspection.inspection_type ?? row.inspection_type;
		}
		// Add violation to inspection, if present and not already in list
		if (violation) {
			// (Optional: check for existing to avoid duplicates)
			inspection.violations.push(violation);
		}
	}
	// Sort inspections by most recent date (descending)
	for (const restaurant of restaurantsMap.values()) {
		restaurant.inspections.sort((a, b) => {
			// Compare as ISO date strings
			return b.inspection_date.localeCompare(a.inspection_date);
		});
	}
	return Array.from(restaurantsMap.values());
}
