import type { FullInspectionData } from "@/types/restaurant";

export const VIOLATION_KEYWORDS = [
	"Pest",
	"Temperature",
	"Sanitation",
	"Hygiene",
	"Contamination",
	"Signage",
] as const;

export function formatPhone(p?: string | null) {
	const phone = p ?? "";
	const digits = phone.replace(/\D/g, "");
	if (digits.length === 10)
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	if (digits.length === 11 && digits.startsWith("1"))
		return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
	return phone;
}

export function filterInspections(
	inspections: FullInspectionData[],
	violationFilter?: string | null,
) {
	if (!violationFilter) return inspections;
	const q = violationFilter.toLowerCase();
	return inspections.filter((insp) =>
		insp.violations?.some((v) =>
			v.violation_description?.toLowerCase().includes(q),
		),
	);
}

export function computeStats(inspections: FullInspectionData[]) {
	const closureCount = inspections.filter((i) =>
		i.action?.toLowerCase().includes("closed"),
	).length;
	const numericScores = inspections
		.map((i) => Number(i.score))
		.filter((s) => !Number.isNaN(s));
	const avgScore = numericScores.length
		? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(
				1,
			)
		: "N/A";
	return { closureCount, avgScore };
}

export function gradeVariant(g?: string) {
	return g === "A"
		? "success"
		: g === "B"
			? "secondary"
			: g === "C"
				? "destructive"
				: "outline";
}

export function getLeftFillColor(grade?: string) {
	return grade === "A"
		? "#16a34a"
		: grade === "B"
			? "#eab308"
			: grade === "C"
				? "#ef4444"
				: "#9ca3af";
}

export function getGradeBorderClass(grade?: string) {
	return grade === "A"
		? "border-t-green-500 border-r-green-500 border-b-green-500 border-l-transparent"
		: grade === "B"
			? "border-t-yellow-500 border-r-yellow-500 border-b-yellow-500 border-l-transparent"
			: grade === "C"
				? "border-t-red-500 border-r-red-500 border-b-red-500 border-l-transparent"
				: "border-t-gray-400 border-r-gray-400 border-b-gray-400 border-l-transparent";
}

export function mapInspectionView(
	inspections: FullInspectionData[],
	violationFilter?: string | null,
) {
	const q = violationFilter?.toLowerCase();
	return inspections.map((insp, idx) => ({
		...insp,
		leftFillColor: getLeftFillColor(insp.grade),
		gradeBorderClass: getGradeBorderClass(insp.grade),
		matchesFilter: Boolean(
			q &&
				insp.violations?.some((v) =>
					v.violation_description?.toLowerCase().includes(q),
				),
		),
		animationDelay: `${idx * 80}ms`,
	}));
}

export type ViewInspection = FullInspectionData & {
	leftFillColor: string;
	gradeBorderClass: string;
	matchesFilter: boolean;
	animationDelay: string;
};

export default {};
