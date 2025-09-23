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
	const img = image ?? SITE_DEFAULT_OG_IMAGE;

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
		{ name: "twitter:image", content: img },
		...(url ? [{ property: "og:url", content: url }] : []),
	];
}
