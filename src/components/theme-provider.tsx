import { setThemeServerFn } from "@/lib/theme";
import { ScriptOnce, useRouter } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

export type UserTheme = "light" | "dark" | "system";
export type AppTheme = "light" | "dark";
export type ServerTheme = "light" | "dark";

const storageKey = "ui-theme";

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

	// Persist user choice in localStorage via usehooks-ts. Use initializeWithValue:false
	// so SSR doesn't try to read localStorage during server render; default to 'system'.
	const [userTheme, setUserTheme] = useLocalStorage<UserTheme>(
		storageKey,
		"system",
		{ initializeWithValue: false },
	);

	// Media query hook to observe system preference changes.
	const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", {
		defaultValue: false,
		initializeWithValue: false,
	});

	const appTheme = useMemo<AppTheme>(() => {
		return userTheme === "system"
			? prefersDark
				? "dark"
				: "light"
			: (userTheme as AppTheme);
	}, [userTheme, prefersDark]);

	// Apply theme classes to <html>. Keep this focused and minimal.
	useEffect(() => {
		try {
			if (userTheme === "system") {
				const sys = prefersDark ? "dark" : "light";
				document.documentElement.classList.remove("light", "dark");
				document.documentElement.classList.add(sys, "system");
			} else {
				document.documentElement.classList.remove("light", "dark", "system");
				document.documentElement.classList.add(userTheme as string);
			}
		} catch (e) {
			// ignore in non-browser environments
		}
	}, [userTheme, prefersDark]);

	async function setTheme(t: UserTheme) {
		const validated =
			t === "light" || t === "dark" || t === "system" ? t : "system";
		// Persist via useLocalStorage setter
		setUserTheme(validated);
		// Also apply immediately to document for an instant visual response
		try {
			if (validated === "system") {
				const sys = getSystemTheme();
				document.documentElement.classList.remove("light", "dark");
				document.documentElement.classList.add(sys, "system");
			} else {
				document.documentElement.classList.remove("light", "dark", "system");
				document.documentElement.classList.add(validated);
			}
		} catch (_) {}

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
