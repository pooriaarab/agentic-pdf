import { describe, expect, test } from "vitest";
import { fillPdf, mergePdfs, splitPdf, VendorPdfAdapter } from "./core.js";

describe("PDF operations", () => {
  test("fills as a dry run by default", async () => {
    await expect(fillPdf({ input: "form.pdf", output: "out.pdf", fields: { name: "Ada" } })).resolves.toEqual({ operation: "fill", dryRun: true, inputs: ["form.pdf"], output: "out.pdf", fields: { name: "Ada" } });
  });
  test("merges as a dry run by default", async () => {
    await expect(mergePdfs({ inputs: ["one.pdf", "two.pdf"], output: "all.pdf" })).resolves.toMatchObject({ operation: "merge", dryRun: true });
  });
  test("splits selected pages", async () => {
    await expect(splitPdf({ input: "one.pdf", output: "pages.pdf", pages: [3, 1, 3] })).resolves.toMatchObject({ pages: [1, 3], dryRun: true });
  });
  test("live vendor clearly requires a key", async () => {
    const vendor = new VendorPdfAdapter("");
    await expect(fillPdf({ input: "a.pdf", output: "b.pdf", fields: { x: "y" }, dryRun: false }, vendor)).rejects.toThrow("missing AGENTIC_PDF_API_KEY");
  });
});

describe("Adobe Acrobat Services adapter", () => {
  test("calls Adobe's HTTPS host with a supplied fetch", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fakeFetch: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response("", { status: 200 });
    };
    const vendor = new VendorPdfAdapter("test-key", fakeFetch);
    await vendor.fill({ input: "form.pdf", output: "out.pdf", fields: { name: "Ada" } });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://pdf-services.adobe.io/operation/createpdf");
    expect(calls[0].init?.method).toBe("POST");
  });
});
