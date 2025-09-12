import { groupRestaurants } from "@/lib/utils";
import type { RestaurantRaw } from "@/schema/schema";
import { describe, expect, it } from "vitest";

describe("groupRestaurants", () => {
	it("merges inspection-level fields when multiple rows belong to the same inspection", () => {
		const camis = "12345";
		const inspection_date = "2024-01-01T10:00:00.000";

		// Build minimal rows that satisfy required fields in RestaurantRaw
		const base = {
			camis,
			dba: "Test Diner",
			boro: "Manhattan",
			street: "Main St",
			inspection_date,
		} as const;

		// Row 1: contains grade but no violation
		const row1: RestaurantRaw = {
			...base,
			// optional fields left undefined when not present
			grade: "A",
		} as unknown as RestaurantRaw;

		// Row 2: same inspection, contains a violation and critical_flag but no grade
		const row2: RestaurantRaw = {
			...base,
			violation_code: "10A",
			violation_description: "Rodent activity",
			critical_flag: "Critical",
		} as unknown as RestaurantRaw;

		const restaurants = groupRestaurants([row1, row2]);

		expect(restaurants).toHaveLength(1);
		const r = restaurants[0];
		expect(r.inspections).toHaveLength(1);
		const insp = r.inspections[0];

		// Both grade and critical_flag should be present on the merged inspection
		expect(insp.grade).toBe("A");
		expect(insp.critical_flag).toBe("Critical");

		// Violation should be included
		expect(insp.violations).toHaveLength(1);
		expect(insp.violations[0].violation_code).toBe("10A");
		expect(insp.violations[0].violation_description).toContain("Rodent");
	});
});
