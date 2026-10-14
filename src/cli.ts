#!/usr/bin/env node
import { fillPdf, mergePdfs, parseFields, parsePages, splitPdf, VendorError, VendorPdfAdapter } from "./core.js";
import { VERSION } from "./version.js";

const help = `agentic-pdf ${VERSION}\n\nUsage: agentic-pdf <fill|merge|split|mcp> [flags]\n\nDry run is the default. Use --live to call the configured vendor.\n\n  fill --input form.pdf --output done.pdf --fields '{"name":"Ada"}'\n  merge --input one.pdf --input two.pdf --output merged.pdf\n  split --input source.pdf --output page.pdf --pages 1,3\n`;
function flags(argv: string[]): Record<string, string | boolean | string[]> {
  const found: Record<string, string | boolean | string[]> = {};
  for (let i = 0; i < argv.length; i += 1) { const key = argv[i]; if (!key.startsWith("--")) throw new Error(`unknown argument "${key}"`); const name = key.slice(2); if (name === "live") { found.live = true; continue; } const value = argv[++i]; if (!value) throw new Error(`${key} needs a value`); if (name === "input") found.input = [...((found.input as string[] | undefined) ?? []), value]; else found[name] = value; }
  return found;
}
export async function runCli(argv: string[]): Promise<number> {
  const command = argv[0];
  if (!command || command === "--help" || command === "-h") { console.log(help); return 0; }
  if (command === "--version" || command === "-V") { console.log(VERSION); return 0; }
  if (command === "mcp") { const { startMcp } = await import("./mcp.js"); await startMcp(); return 0; }
  try {
    const f = flags(argv.slice(1)); const inputs = (f.input as string[] | undefined) ?? []; const output = f.output as string | undefined;
    if (!output) throw new Error("--output needs a value");
    const vendor = f.live ? new VendorPdfAdapter() : undefined; const dryRun = !f.live;
    const result = command === "fill" ? await fillPdf({ input: inputs[0] ?? "", output, fields: parseFields(String(f.fields ?? "")), dryRun }, vendor)
      : command === "merge" ? await mergePdfs({ inputs, output, dryRun }, vendor)
      : command === "split" ? await splitPdf({ input: inputs[0] ?? "", output, pages: parsePages(String(f.pages ?? "")), dryRun }, vendor)
      : (() => { throw new Error(`unknown command "${command}"`); })();
    console.log(JSON.stringify(result)); return 0;
  } catch (error) { console.error(`${error instanceof VendorError ? "VendorError" : "Error"}: ${error instanceof Error ? error.message : String(error)}`); return 1; }
}
runCli(process.argv.slice(2)).then((code) => { if (code) process.exit(code); });
