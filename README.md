# Yomuco

Yomuco – A simple web crawling library for Node.js

## Setup

```bash
bun add yomuco
```

## Getting Started

```typescript
import { getBrowser, getUrls, getContent } from "yomuco";
```

### Set up a browser instance using Playwright

```typescript
const browser = await getBrowser();

browser.close();
```

### Retrieve URLs from a page

```typescript
const browser = await getBrowser();

const urls = await getUrls({
  context: await browser.newContext(),
  fromUrl: "https://react.dev",
  maxDepth: 1,
});

browser.close();
```

### Fetch a page content

```typescript
const browser = await getBrowser();

for (const url of urls) {
  const content = await getContent({
    context: await browser.newContext(),
    url,
    selector: "main",
  });
}

browser.close();
```

## Format

```bash
bunx @biomejs/biome format --write .
```

## Lint

```bash
bunx @biomejs/biome lint --apply .
```

## Test

```bash
bun test
```

## License

MIT
