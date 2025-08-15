import { type NycRawInspection, nycRawInspectionSchema } from "@/schema/schema";

export async function fetchRawInspections(
	params: Record<string, unknown>,
	appToken?: string,
): Promise<NycRawInspection[]> {
	const baseUrl = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
	const searchParams = new URLSearchParams(params as Record<string, string>);
	const url = `${baseUrl}?${searchParams.toString()}`;

	const res = await fetch(url, {
		headers: {
			Accept: "application/json",
			...(appToken ? { "X-App-Token": appToken } : {}),
		},
	});
	if (!res.ok) throw new Error("Failed to fetch inspections");
	const data = await res.json();

	return nycRawInspectionSchema.array().parse(data);
}
