# agentic-pdf

[![npm version](https://img.shields.io/npm/v/agentic-pdf)](https://www.npmjs.com/package/agentic-pdf)
[![Downloads/month](https://img.shields.io/npm/dm/agentic-pdf)](https://www.npmjs.com/package/agentic-pdf)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/agentic-pdf) · [Source and support](https://github.com/pooriaarab/agentic-pdf)

agentic-pdf is an open-source PDF request-preview wrapper for Node.js agents, with scaffolded local operations and an Adobe Acrobat PDF Services adapter.

## Install

```sh
npm install agentic-pdf
```

Requires Node.js 18 or later. Includes TypeScript declarations.

## Preview your first PDF request

```sh
npx agentic-pdf fill --input form.pdf --output filled.pdf --fields '{"name":"Ada"}'
```

The JSON result contains `operation: "fill"`, `dryRun: true`, and the requested fields.
This preview needs no existing files, credentials, or environment variables. It creates no output file.

The library uses the same preview default:

```js
import { splitPdf } from 'agentic-pdf';
console.log(await splitPdf({ input: 'source.pdf', output: 'pages.pdf', pages: [3, 1, 3] }));
```

The result lists `pages: [1, 3]` with `dryRun: true`.

## Features and implementation status

- **Request previews:** validate `.pdf` extensions, nonempty fields, and positive page numbers.
- **Page selection:** sorts and deduplicates requested page numbers.
- **Adapter interface:** SDK callers can inject a `PdfVendor` implementation.

| Path | Status | Current behavior |
| --- | --- | --- |
| Local fill | scaffold | Copies input bytes; does not fill fields |
| Local merge | scaffold | Concatenates bytes; does not build a valid merged PDF |
| Local split | scaffold | Copies input bytes; does not extract pages |
| Adobe Acrobat PDF Services | scaffold | Posts operation requests; does not retrieve output files |

There are three operation APIs and two adapter classes. Tests check previews and mocked Adobe request routing, not completed PDF transformations.
The package does not invoke PDFtk or Adobe Acrobat desktop software.

## Runtime surfaces

CLI commands are `fill`, `merge`, `split`, and `mcp`, plus `--help` / `-h` and `--version` / `-V`.

```sh
npx agentic-pdf merge --input first.pdf --input second.pdf --output merged.pdf
npx agentic-pdf split --input source.pdf --output pages.pdf --pages 1,3
npx agentic-pdf mcp
```

The dedicated `agentic-pdf-mcp` executable also starts the stdio Model Context Protocol (MCP) server.
Its three tools are `fill_pdf`, `merge_pdfs`, and `split_pdf`; each defaults to `dryRun: true`.

## Limits and live behavior

Preview first. CLI `--live` selects the Adobe scaffold and requires `AGENTIC_PDF_API_KEY` in the process environment.
The package does not load `.env` files. The adapter sends input strings as Adobe asset IDs, not uploaded local files.
It maps fill, merge, and split to `setformdata`, `combinepdf`, and `splitpdf` on `pdf-services.adobe.io`.
An HTTP success does not mean the requested output file exists; the adapter ignores the response body.
SDK and MCP calls with `dryRun: false` use the local scaffold unless an SDK caller supplies another vendor.
No live Adobe credentials or completed PDF outputs are verified by this rewrite.

## Status and license

Version 0.1.1 is a scaffold with interfaces that can change. Report problems through [GitHub issues](https://github.com/pooriaarab/agentic-pdf/issues).

MIT.
