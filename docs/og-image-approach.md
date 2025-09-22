# OG image approach for Cleanplate

Goal

- Provide meaningful Open Graph (OG) images for restaurant detail pages so embeds (Twitter, Slack, etc.) display useful previews instead of the generic hero image.

Requirements

- Use the existing `seo()` helper to centralize meta generation.
- Avoid unneeded duplication across routes.
- Prefer real restaurant photos when available; fall back to a generated placeholder.
- Ensure absolute URLs for OG images when SITE_URL is configured.

Current pragmatic implementation

- Route-level head uses `seo({ title, description, image, url })`.
- For restaurant pages: use the site default OG image (absolute when SITE_URL present). If no site default is desired, generate a placeholder using `https://placehold.co/1200x630/{bg}/{fg}?text=X` where X is the restaurant initial.

Longer-term recommendations

1. Store or generate per-restaurant thumbnails
   - If the data source can provide a photo URL, prefer that (store in restaurant DTO).
   - If not available, consider generating static OG images during a build step (serverless function) using a template engine (Puppeteer, Satori, or an image generation service) that overlays restaurant name, grade, and borough on a branded background. Store generated images in a CDN.

2. Use an image CDN and canonical sizes
   - Serve OG images at 1200x630 (Twitter/Facebook recommended) and provide proper caching headers.
   - Use an external CDN (Cloudflare, Vercel) or S3 bucket to host generated images.

3. SEO/meta tests
   - Add an integration test that requests the restaurant route HTML (SSR output) and asserts presence of og:image, og:title, og:description, and canonical link.

Implementation TODOs

- Next: create a small integration test for route head values. (Low-risk)
- Medium: add per-restaurant image generation (requires infra).

Notes

- Twitter and other platforms prefer absolute URLs for OG images; ensure SITE_URL is set in production.
- Metadata should include og:url and rel=canonical to avoid duplicate content issues.
