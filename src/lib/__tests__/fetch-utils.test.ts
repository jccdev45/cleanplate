import {
	parseNum,
	retryFetch,
	sanitizeSnippet,
	stripQuotes,
} from "@/lib/fetch-utils";
import { describe, expect, it, vi } from "vitest";

describe("fetch-utils", () => {
	it("stripQuotes trims and removes surrounding quotes", () => {
		expect(stripQuotes('  "hello"  ')).toBe("hello");
		expect(stripQuotes("noquotes")).toBe("noquotes");
		expect(stripQuotes(undefined)).toBeUndefined();
		expect(stripQuotes("")).toBe("");
	});

	it("parseNum parses numbers and returns undefined for invalid", () => {
		expect(parseNum('  "123" ')).toBe(123);
		expect(parseNum("not-a-number")).toBeUndefined();
		expect(parseNum(undefined)).toBeUndefined();
		expect(parseNum("")).toBeUndefined();
	});

	it("sanitizeSnippet strips html and truncates", () => {
		const html = "<div>hello <b>world</b></div>";
		expect(sanitizeSnippet(html)).toBe("hello world");
		const long = "x".repeat(2000);
		expect(sanitizeSnippet(long, 10)).toBe("xxxxxxxxxx");
	});

	it("retryFetch retries on 5xx and returns last response", async () => {
		// Make a mock fetch sequence: 500, 502, 200
		const mock = vi.fn();
		const r500 = {
			ok: false,
			status: 500,
			statusText: "Server",
			text: async () => "err",
		};
		const r502 = {
			ok: false,
			status: 502,
			statusText: "Server2",
			text: async () => "err2",
		};
		const r200 = {
			ok: true,
			status: 200,
			statusText: "OK",
			text: async () => "ok",
		};
		mock
			.mockResolvedValueOnce(r500)
			.mockResolvedValueOnce(r502)
			.mockResolvedValueOnce(r200);
		// @ts-ignore
		global.fetch = mock;

		const res = await retryFetch(
			"http://example.test",
			{ method: "GET" },
			3,
			1,
		);
		expect(res).toBe(r200);
		expect(mock).toHaveBeenCalledTimes(3);
	});

	it("retryFetch stops retrying on 4xx and returns that response", async () => {
		const mock = vi.fn();
		const r400 = {
			ok: false,
			status: 400,
			statusText: "Bad",
			text: async () => "bad",
		};
		mock.mockResolvedValueOnce(r400);
		// @ts-ignore
		global.fetch = mock;

		const res = await retryFetch(
			"http://example.test",
			{ method: "GET" },
			3,
			1,
		);
		expect(res).toBe(r400);
		expect(mock).toHaveBeenCalledTimes(1);
	});
});
