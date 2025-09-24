import {
	SITE_DEFAULT_DESCRIPTION,
	SITE_DEFAULT_OG_IMAGE,
	SITE_NAME,
	SITE_URL,
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
	// Use SITE_URL from constants which centralizes env handling. If SITE_URL
	// is blank we'll fall back to the site-default image path so environments
	// without an explicit URL (local dev, preview builds) still work.
	let img = image ?? SITE_DEFAULT_OG_IMAGE;
	if (SITE_URL) {
		if (img.startsWith("/")) {
			img = `${SITE_URL}${img}`;
		} else if (!/^https?:\/\//i.test(img)) {
			img = `${SITE_URL}/${img.replace(/^\/+/, "")}`;
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
