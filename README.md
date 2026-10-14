# Agentic PDF

Agentic PDF fills PDF forms, merges PDF files, and splits PDF files on your local machine. It is for people searching for **PDF**, **fill a PDF form**, **merge PDF**, **split PDF**, **pdftk**, or **Adobe Acrobat PDF Services**. The default command is a dry run: it exits 0, changes no file, and uses no network.

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

## Live Adobe Acrobat PDF Services commands

`--live` sends a request only to the Adobe Acrobat PDF Services operation that matches the command:

| Command | Adobe operation |
| --- | --- |
| `fill` | `setformdata` |
| `merge` | `combinepdf` |
| `split` | `splitpdf` |

Set `AGENTIC_PDF_API_KEY` before using `--live`. The default remains a local dry run and uses no network. `pdftk` is a search keyword only; this package does not invoke it.

## CLI

```sh
# Preview a merge
agentic-pdf merge --input first.pdf --input second.pdf --output merged.pdf

# Preview a split
agentic-pdf split --input source.pdf --output pages.pdf --pages 1,3
```

These are dry runs by default. To make a live Adobe Acrobat PDF Services request, append `--live` and set `AGENTIC_PDF_API_KEY`.

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
