import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const getSidebarStateServerFn = createServerFn().handler(async () => {
	const val = getCookie(SIDEBAR_COOKIE_NAME);
	if (val === "true") return true;
	if (val === "false") return false;
	return undefined;
});

export default getSidebarStateServerFn;
