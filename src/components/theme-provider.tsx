import { setThemeServerFn } from "@/lib/theme";
import { ScriptOnce, useRouter } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type UserTheme = "light" | "dark" | "system";
export type AppTheme = "light" | "dark";
export type ServerTheme = "light" | "dark";

const storageKey = "ui-theme";

function getStoredUserTheme(): UserTheme {
	try {
		const v =
			typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
		if (v === "light" || v === "dark" || v === "system") return v;
	} catch (_) {}
	return "system";
}

function getSystemTheme(): AppTheme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function themeInitScript(serverTheme: ServerTheme) {
	function init() {
		try {
			const stored = localStorage.getItem("ui-theme");
			const hasStored =
				stored === "light" || stored === "dark" || stored === "system";
			const valid = hasStored ? stored : serverTheme || "light";

			if (valid === "system") {
				const sysTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";
				document.documentElement.classList.add(sysTheme, "system");
			} else {
				document.documentElement.classList.add(valid);
			}
		} catch (e) {
			const sysTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			document.documentElement.classList.add(sysTheme, "system");
		}
	}
	return `(${init.toString()})();`;
}

type ThemeContextVal = {
	userTheme: UserTheme;
	appTheme: AppTheme;
	setTheme: (t: UserTheme) => void;
};

const ThemeContext = createContext<ThemeContextVal | null>(null);

type Props = { children?: ReactNode; theme?: ServerTheme };

export function ThemeProvider({ children, theme: serverTheme }: Props) {
	const router = useRouter();
	const [userTheme, setUserTheme] = useState<UserTheme>(() =>
		getStoredUserTheme(),
	);

	useEffect(() => {
		if (userTheme === "system") {
			const m = window.matchMedia("(prefers-color-scheme: dark)");
			const handler = () => {
				const sys = m.matches ? "dark" : "light";
				document.documentElement.classList.remove("light", "dark");
				document.documentElement.classList.add(sys, "system");
			};
			m.addEventListener("change", handler);
			return () => m.removeEventListener("change", handler);
		}
		return;
	}, [userTheme]);

	const appTheme = useMemo<AppTheme>(
		() => (userTheme === "system" ? getSystemTheme() : (userTheme as AppTheme)),
		[userTheme],
	);

	async function setTheme(t: UserTheme) {
		const validated =
			t === "light" || t === "dark" || t === "system" ? t : "system";
		setUserTheme(validated);
		try {
			localStorage.setItem(storageKey, validated);
		} catch (_) {}

		// apply immediately to document
		if (validated === "system") {
			const sys = getSystemTheme();
			document.documentElement.classList.remove("light", "dark");
			document.documentElement.classList.add(sys, "system");
		} else {
			document.documentElement.classList.remove("light", "dark", "system");
			document.documentElement.classList.add(validated);
		}

		// persist on server (store cookie) and invalidate router so server-rendered
		// values are in sync for subsequent navigations.
		try {
			await setThemeServerFn({
				data:
					validated === "system" ? getSystemTheme() : (validated as AppTheme),
			});
			await router.invalidate();
		} catch (err) {
			console.error("Failed to persist theme on server:", err);
		}
	}

	return (
		<ThemeContext.Provider value={{ userTheme, appTheme, setTheme }}>
			<ScriptOnce>{themeInitScript(serverTheme ?? "light")}</ScriptOnce>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
