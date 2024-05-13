import playwright from "playwright";
import * as path from "node:path";

export const getBrowser = async () => {
  return await playwright.chromium.launch();
};

export const getUrls = async ({
  context,
  fromUrl,
  maxDepth,
}: {
  context: playwright.BrowserContext;
  fromUrl: string;
  maxDepth: number;
}) => {
  const visitedUrls = new Set<[number, string]>();

  const crawlURL = async ({ url, depth }: { url: string; depth: number }) => {
    if (visitedUrls.has([depth, url])) {
      return;
    }

    visitedUrls.add([depth, url]);

    if (depth >= maxDepth) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const page = await context.newPage();
      await page.goto(url);

      for (const link of await page.$$("a")) {
        const href = await link.getAttribute("href");

        if (href == null) {
          continue;
        }

        const absoluteUrl = new URL(href, url);

        if (new URL(absoluteUrl).host === new URL(fromUrl).host) {
          const extname = path.extname(absoluteUrl.href);

          if (
            extname === "" ||
            extname === ".html" ||
            extname === ".htm" ||
            extname === ".php" ||
            extname === ".jsp" ||
            extname === ".asp" ||
            extname === ".aspx"
          ) {
            await crawlURL({ url: absoluteUrl.href, depth: depth + 1 });
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  };

  await crawlURL({ url: fromUrl, depth: 0 });

  await context.close();

  return [...new Set([...visitedUrls].map(([, url]) => url))];
};

export const getContent = async ({
  context,
  url,
  selector,
}: {
  context: playwright.BrowserContext;
  url: string;
  selector: string;
}) => {
  const page = await context.newPage();
  await page.goto(url);

  const body = await page.locator(selector).textContent();

  await context.close();

  return body;
};
