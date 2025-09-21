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
