import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fillPdf, mergePdfs, splitPdf } from "./core.js";
const result = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] });
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "agentic-pdf", version: "0.1.0" });
  server.registerTool("fill_pdf", { description: "Preview filling PDF form fields. dryRun defaults to true.", inputSchema: { input: z.string(), output: z.string(), fields: z.record(z.string()), dryRun: z.boolean().optional() } }, async (input) => result(await fillPdf(input)));
  server.registerTool("merge_pdfs", { description: "Preview merging PDF files. dryRun defaults to true.", inputSchema: { inputs: z.array(z.string()).min(2), output: z.string(), dryRun: z.boolean().optional() } }, async (input) => result(await mergePdfs(input)));
  server.registerTool("split_pdf", { description: "Preview extracting pages from one PDF. dryRun defaults to true.", inputSchema: { input: z.string(), output: z.string(), pages: z.array(z.number().int().positive()).min(1), dryRun: z.boolean().optional() } }, async (input) => result(await splitPdf(input)));
  return server;
}
export async function startMcp(): Promise<void> { const server = createMcpServer(); await server.connect(new StdioServerTransport()); }
