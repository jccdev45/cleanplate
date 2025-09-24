import {
	SITE_DEFAULT_DESCRIPTION,
	SITE_DEFAULT_OG_IMAGE,
	SITE_NAME,
} from "@/lib/constants";

type SeoOpts = {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
};

export function seo({ title, description, image, url }: SeoOpts) {
	const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
	const desc = description ?? SITE_DEFAULT_DESCRIPTION;
	// Compute a site URL. If SITE_URL is explicitly provided in the env use it,
	// otherwise fall back to Vercel's VERCEL_URL (available during builds and
	// serverless invocations). This helps produce absolute URLs for OG images
	// without requiring an env var to be manually set in every environment.
	const rawSiteUrl = process.env.SITE_URL ?? process.env.VERCEL_URL ?? "";
	const siteUrl = rawSiteUrl
		? // If VERCEL_URL is provided it usually lacks protocol, so ensure it has one
			rawSiteUrl.match(/^https?:\/\//)
			? rawSiteUrl.replace(/\/+$/, "")
			: `https://${rawSiteUrl.replace(/\/+$/, "")}`
		: "";

	let img = image ?? SITE_DEFAULT_OG_IMAGE;
	if (siteUrl) {
		if (img.startsWith("/")) {
			img = `${siteUrl}${img}`;
		} else if (!/^https?:\/\//i.test(img)) {
			img = `${siteUrl}/${img.replace(/^\/+/, "")}`;
		}
	}

	return [
		{ title: fullTitle },
		{ name: "description", content: desc },
		{ property: "og:title", content: fullTitle },
		{ property: "og:description", content: desc },
		{ property: "og:image", content: img },
		{ property: "og:type", content: "website" },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: fullTitle },
		{ name: "twitter:description", content: desc },
		// Provide both twitter image tags for maximum compatibility and an
		// accessible alt text. Some crawlers look for `twitter:image:src`.
		{ name: "twitter:image", content: img },
		{ name: "twitter:image:src", content: img },
		{ name: "twitter:image:alt", content: title ?? SITE_NAME },
		...(url ? [{ property: "og:url", content: url }] : []),
	];
}
