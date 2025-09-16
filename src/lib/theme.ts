import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const storageKey = "ui-theme";

export const getThemeServerFn = createServerFn().handler(async () => {
	// read cookie on server; fallback to light
	return (getCookie(storageKey) || "light") as "light" | "dark";
});

export const setThemeServerFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (typeof data !== "string" || (data !== "dark" && data !== "light")) {
			throw new Error("Invalid theme provided");
		}
		return data as "light" | "dark";
	})
	.handler(async ({ data }) => {
		// set cookie; prefer secure in production (this example uses simple options)
		setCookie(storageKey, data, {
			path: "/",
			sameSite: "lax",
			// set a long-ish maxAge so preference persists
			maxAge: 60 * 60 * 24 * 365,
			secure: process.env.NODE_ENV === "production",
		});
		return data;
	});
