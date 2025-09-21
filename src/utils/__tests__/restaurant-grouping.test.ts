import type { RestaurantRaw } from "@/schema/schema";
import { groupRestaurants } from "@/utils/restaurant-grouping";
import { describe, expect, it } from "vitest";

describe("groupRestaurants", () => {
	it("groups rows by camis and merges inspections/violations", () => {
		const rows: RestaurantRaw[] = [
			{
				camis: "123",
				dba: "Taco Place",
				boro: "Manhattan",
				street: "Main St",
				inspection_date: "2023-01-02T00:00:00.000",
				violation_code: "V1",
				violation_description: "Bad",
				critical_flag: "Not Critical",
				score: 10,
			},
			{
				camis: "123",
				dba: "Taco Place",
				boro: "Manhattan",
				street: "Main St",
				inspection_date: "2023-01-02T00:00:00.000",
				grade: "A",
				grade_date: "2023-01-03T00:00:00.000",
			},
		];
		const result = groupRestaurants(rows);
		expect(result).toHaveLength(1);
		const r = result[0];
		expect(r.camis).toBe("123");
		expect(r.inspections).toHaveLength(1);
		const insp = r.inspections[0];
		expect(insp.grade).toBe("A");
		expect(insp.violations.length).toBeGreaterThanOrEqual(1);
	});
});
