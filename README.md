# Agentic PDF

Agentic PDF fills PDF forms, merges PDF files, and splits PDF files on your local machine. It is for people searching for **PDF**, **fill a PDF form**, **merge PDF**, **split PDF**, **pdftk**, or **Adobe Acrobat**. The default command is a dry run: it exits 0, changes no file, and uses no network.

## Install

```sh
npm install agentic-pdf
```

## Quick start

Preview a form fill without changing a file or using the network:

```sh
npx agentic-pdf fill --input form.pdf --output filled.pdf --fields '{"name":"Ada"}'
```

It prints JSON. Add `--live` only after the preview looks right.

## Vendors

| Brand | Environment key | Live command |
| --- | --- | --- |
| Adobe Acrobat Services | `AGENTIC_PDF_API_KEY` | `agentic-pdf fill --input form.pdf --output filled.pdf --fields '{"name":"Ada"}' --live` |

The Adobe Acrobat Services adapter calls Adobe's HTTPS API. It needs `AGENTIC_PDF_API_KEY`.

## CLI

```sh
# Preview a merge
agentic-pdf merge --input first.pdf --input second.pdf --output merged.pdf

# Preview a split
agentic-pdf split --input source.pdf --output pages.pdf --pages 1,3
```

These are dry runs by default. To make a live Adobe Acrobat Services request, append `--live` and set the environment key shown above.

## Library

```js
import { fillPdf } from "agentic-pdf";

const result = await fillPdf({
  input: "form.pdf",
  output: "filled.pdf",
  fields: { name: "Ada" },
});
```

## MCP

```sh
npx agentic-pdf mcp
```

The server exposes `fill_pdf`, `merge_pdfs`, and `split_pdf`. Their result shapes match the CLI and library.

## License

MIT.
