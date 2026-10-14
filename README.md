# Agentic PDF

Fill form fields. Merge files. Split one PDF.

Local dry runs are the default. No network is used unless you pass `--live`.

## Install

```sh
npm install agentic-pdf
```

## Quick start

Preview a form fill:

```sh
npx agentic-pdf fill --input form.pdf --output filled.pdf --fields '{"name":"Ada"}'
```

It prints JSON and does not change a file. Pass `--live` to use the configured vendor. Set `AGENTIC_PDF_API_KEY` first.

## Three uses

### CLI

```sh
agentic-pdf merge --input first.pdf --input second.pdf --output merged.pdf
agentic-pdf split --input source.pdf --output pages.pdf --pages 1,3
```

### Library

```js
import { fillPdf } from "agentic-pdf";

const result = await fillPdf({
  input: "form.pdf",
  output: "filled.pdf",
  fields: { name: "Ada" },
});
```

### MCP

```sh
npx agentic-pdf mcp
```

The server exposes `fill_pdf`, `merge_pdfs`, and `split_pdf`. Their result shapes match the CLI and library.

## Live calls

`--live` requires `AGENTIC_PDF_API_KEY`. A missing key returns a clear error. Vendor errors are returned without being hidden.

## License

MIT.
