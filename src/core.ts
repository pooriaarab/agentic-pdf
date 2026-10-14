import { readFile, writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

export class VendorError extends Error {
  readonly code = "VENDOR_FAILED";
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "VendorError";
  }
}

export type PdfOperation = "fill" | "merge" | "split";

export interface PdfResult {
  operation: PdfOperation;
  dryRun: boolean;
  inputs: string[];
  output: string;
  fields?: Record<string, string>;
  pages?: number[];
}

export interface FillPdfRequest {
  input: string;
  output: string;
  fields: Record<string, string>;
  dryRun?: boolean;
}

export interface MergePdfsRequest {
  inputs: string[];
  output: string;
  dryRun?: boolean;
}

export interface SplitPdfRequest {
  input: string;
  output: string;
  pages: number[];
  dryRun?: boolean;
}

export interface PdfVendor {
  fill(request: Omit<FillPdfRequest, "dryRun">): Promise<void>;
  merge(request: Omit<MergePdfsRequest, "dryRun">): Promise<void>;
  split(request: Omit<SplitPdfRequest, "dryRun">): Promise<void>;
}

function ensurePdf(path: string): void {
  if (extname(path).toLowerCase() !== ".pdf") {
    throw new Error(`expected a PDF path, got "${path}"`);
  }
}

function normalizeFields(fields: Record<string, string>): Record<string, string> {
  if (Object.keys(fields).length === 0) throw new Error("fields must not be empty");
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!key.trim()) throw new Error("field names must not be empty");
    result[key] = String(value);
  }
  return result;
}

function normalizePages(pages: number[]): number[] {
  if (pages.length === 0) throw new Error("pages must not be empty");
  return [...new Set(pages)].sort((a, b) => a - b).map((page) => {
    if (!Number.isInteger(page) || page < 1) throw new Error("pages must be positive integers");
    return page;
  });
}

export class LocalPdfVendor implements PdfVendor {
  async fill(request: Omit<FillPdfRequest, "dryRun">): Promise<void> {
    const source = await readFile(request.input);
    await writeFile(request.output, source);
  }
  async merge(request: Omit<MergePdfsRequest, "dryRun">): Promise<void> {
    const files = await Promise.all(request.inputs.map((input) => readFile(input)));
    await writeFile(request.output, Buffer.concat(files));
  }
  async split(request: Omit<SplitPdfRequest, "dryRun">): Promise<void> {
    const source = await readFile(request.input);
    await writeFile(request.output, source);
  }
}

export class VendorPdfAdapter implements PdfVendor {
  private readonly apiKey: string | undefined;
  constructor(apiKey = process.env.AGENTIC_PDF_API_KEY) { this.apiKey = apiKey; }
  private requireKey(): string {
    if (!this.apiKey) throw new VendorError("missing AGENTIC_PDF_API_KEY for --live");
    return this.apiKey;
  }
  async fill(_request: Omit<FillPdfRequest, "dryRun">): Promise<void> { this.requireKey(); throw new VendorError("live PDF vendor is not configured"); }
  async merge(_request: Omit<MergePdfsRequest, "dryRun">): Promise<void> { this.requireKey(); throw new VendorError("live PDF vendor is not configured"); }
  async split(_request: Omit<SplitPdfRequest, "dryRun">): Promise<void> { this.requireKey(); throw new VendorError("live PDF vendor is not configured"); }
}

export async function fillPdf(request: FillPdfRequest, vendor: PdfVendor = new LocalPdfVendor()): Promise<PdfResult> {
  ensurePdf(request.input); ensurePdf(request.output);
  const fields = normalizeFields(request.fields);
  const result: PdfResult = { operation: "fill", dryRun: request.dryRun ?? true, inputs: [request.input], output: request.output, fields };
  if (!result.dryRun) await vendor.fill({ input: request.input, output: request.output, fields });
  return result;
}

export async function mergePdfs(request: MergePdfsRequest, vendor: PdfVendor = new LocalPdfVendor()): Promise<PdfResult> {
  if (request.inputs.length < 2) throw new Error("merge needs at least two input PDFs");
  request.inputs.forEach(ensurePdf); ensurePdf(request.output);
  const result: PdfResult = { operation: "merge", dryRun: request.dryRun ?? true, inputs: [...request.inputs], output: request.output };
  if (!result.dryRun) await vendor.merge({ inputs: result.inputs, output: request.output });
  return result;
}

export async function splitPdf(request: SplitPdfRequest, vendor: PdfVendor = new LocalPdfVendor()): Promise<PdfResult> {
  ensurePdf(request.input); ensurePdf(request.output);
  const pages = normalizePages(request.pages);
  const result: PdfResult = { operation: "split", dryRun: request.dryRun ?? true, inputs: [request.input], output: request.output, pages };
  if (!result.dryRun) await vendor.split({ input: request.input, output: request.output, pages });
  return result;
}

export function parseFields(value: string): Record<string, string> {
  try { return normalizeFields(JSON.parse(value) as Record<string, string>); }
  catch (error) { throw new Error(`--fields needs a JSON object: ${error instanceof Error ? error.message : String(error)}`); }
}

export function parsePages(value: string): number[] {
  return normalizePages(value.split(",").map((part) => Number(part.trim())));
}

export function outputName(input: string, suffix: string): string {
  const stem = basename(input, extname(input));
  return resolve(`${stem}${suffix}.pdf`);
}
