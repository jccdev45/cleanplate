// Base restaurant information
export interface RestaurantBase {
	camis: string;
	dba: string;
	boro: "Manhattan" | "Bronx" | "Brooklyn" | "Queens" | "Staten Island";
	street: string;
	building?: string;
	zipcode?: string;
	phone?: string;
	cuisine_description?: string;
	latitude?: string;
	longitude?: string;
	// Optional precomputed single-line address for compact marker DTOs
	address?: string;
	community_board?: string;
	council_district?: string;
	census_tract?: string;
	bin?: string;
	bbl?: string;
	nta?: string;
}

// Inspection details
export interface InspectionDetails {
	inspectionId: string;
	inspection_date: string;
	action?: string;
	critical_flag?: string;
	score?: number;
	grade?: "A" | "B" | "C" | "N" | "Z" | "P";
	grade_date?: string;
	inspection_type?: string;
}

// Violation information
export interface Violation {
	violation_code: string;
	violation_description: string;
	critical_flag: string;
}

// Full inspection data
export interface FullInspectionData extends InspectionDetails {
	violations: Violation[];
}

// Restaurant with all inspections
export interface Restaurant extends RestaurantBase {
	inspections: FullInspectionData[];
}
