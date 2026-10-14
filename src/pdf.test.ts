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
