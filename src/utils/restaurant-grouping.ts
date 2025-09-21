import type { RestaurantRaw } from "@/schema/schema";
import type { Restaurant, Violation } from "@/types/restaurant";

export function groupRestaurants(data: RestaurantRaw[]): Restaurant[] {
	const restaurantsMap = new Map<string, Restaurant>();

	for (const row of data) {
		if (!row.camis) continue;

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

		let violation: Violation | undefined = undefined;
		if (row.violation_code && row.violation_description && row.critical_flag) {
			violation = {
				violation_code: row.violation_code,
				violation_description: row.violation_description,
				critical_flag: row.critical_flag,
			};
		}

		const inspectionDateKey = row.inspection_date ?? row.grade_date ?? "";
		const inspectionId = `${row.camis}_${inspectionDateKey}`;
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
			inspection.action = inspection.action ?? row.action;
			inspection.critical_flag = inspection.critical_flag ?? row.critical_flag;
			inspection.score = inspection.score ?? row.score;
			inspection.grade = inspection.grade ?? row.grade;
			inspection.grade_date = inspection.grade_date ?? row.grade_date;
			inspection.inspection_type =
				inspection.inspection_type ?? row.inspection_type;
		}

		if (violation) {
			inspection.violations.push(violation);
		}
	}

	for (const restaurant of restaurantsMap.values()) {
		restaurant.inspections.sort((a, b) => {
			const aEmpty = !a.inspection_date;
			const bEmpty = !b.inspection_date;
			if (aEmpty && bEmpty) return 0;
			if (aEmpty) return 1;
			if (bEmpty) return -1;
			return b.inspection_date.localeCompare(a.inspection_date);
		});
	}

	return Array.from(restaurantsMap.values());
}
