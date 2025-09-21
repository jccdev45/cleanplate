import type { Restaurant } from "@/types/restaurant";
import { aggregateCuisineTrends } from "@/utils/aggregate-inspections";
import { describe, expect, it } from "vitest";

describe("aggregateCuisineTrends", () => {
	it("aggregates inspections across multiple years and cuisines", () => {
		const restaurants = [
			{
				camis: "1",
				dba: "A",
				boro: "Manhattan",
				street: "1st Ave",
				cuisine_description: "Pizza",
				inspections: [
					{
						inspection_date: "2021-05-01T00:00:00.000",
						inspectionId: "1-1",
						violations: [],
					},
					{
						inspection_date: "2022-06-01T00:00:00.000",
						inspectionId: "1-2",
						violations: [],
					},
				],
			},
			{
				camis: "2",
				dba: "B",
				boro: "Brooklyn",
				street: "2nd St",
				cuisine_description: "Sushi",
				inspections: [
					{
						inspection_date: "2021-07-10T00:00:00.000",
						inspectionId: "2-1",
						violations: [],
					},
					{
						inspection_date: "2023-03-15T00:00:00.000",
						inspectionId: "2-2",
						violations: [],
					},
				],
			},
			{
				camis: "3",
				dba: "C",
				boro: "Queens",
				street: "3rd Blvd",
				cuisine_description: "Pizza",
				inspections: [
					// malformed date should be ignored
					{
						inspection_date: "not-a-date",
						inspectionId: "3-1",
						violations: [],
					},
					// missing date ignored
					{ inspection_date: "", inspectionId: "3-2", violations: [] },
				],
			},
		] as unknown as Restaurant[];

		const { data, topCuisines } = aggregateCuisineTrends(restaurants, 2);

		// top cuisines should be Pizza then Sushi
		expect(topCuisines[0]).toBe("Pizza");
		expect(topCuisines[1]).toBe("Sushi");

		// data rows should include years 2021,2022,2023 in order
		const years = data.map((r) => r.year);
		expect(years).toEqual(["2021", "2022", "2023"]);

		// check counts for Pizza in 2021 and 2022
		const row2021 = data.find((r) => r.year === "2021");
		const row2022 = data.find((r) => r.year === "2022");
		const row2023 = data.find((r) => r.year === "2023");

		expect(row2021).toBeDefined();
		expect(row2022).toBeDefined();
		expect(row2023).toBeDefined();

		const r2021 = row2021 as Record<string, number>;
		const r2022 = row2022 as Record<string, number>;
		const r2023 = row2023 as Record<string, number>;

		expect(r2021.Pizza).toBe(1);
		expect(r2022.Pizza).toBe(1);
		expect(r2023.Sushi).toBe(1);
	});

	it("returns empty data for no restaurants", () => {
		const { data, topCuisines } = aggregateCuisineTrends([], 3);
		expect(data).toEqual([]);
		expect(topCuisines).toEqual([]);
	});
});
