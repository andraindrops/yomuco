import { describe, beforeAll, test, expect } from "bun:test";

import { getBrowser, getUrls, getContent } from "../src";

describe("crawler test", () => {
  beforeAll(() => {
    const topPage =
      '<html><body><main><p>hello</p><a href="/a">a</a><a href="/b">b</a><a href="/c">c</a></main></body></html>';

    const aPage =
      '<html><body><main><p>a</p><a href="/a-a">a-a</a><a href="/b">next</a></main></body></html>';
    const bPage =
      '<html><body><main><p>a</p><a href="/b-a">b-a</a><a href="/c">next</a></main></body></html>';
    const cPage =
      '<html><body><main><p>a</p><a href="/c-a">c-a</a><a href="/a">next</a></main></body></html>';

    Bun.serve({
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/") {
          return new Response(topPage, {
            headers: { "Content-Type": "text/html" },
          });
        }
        if (url.pathname === "/a") {
          return new Response(aPage, {
            headers: { "Content-Type": "text/html" },
          });
        }
        if (url.pathname === "/b") {
          return new Response(bPage, {
            headers: { "Content-Type": "text/html" },
          });
        }
        if (url.pathname === "/c") {
          return new Response(cPage, {
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response("404!");
      },
    });
  });

  test("getUrls - depth 1", async () => {
    const browser = await getBrowser();
    const urls = await getUrls({
      context: await browser.newContext(),
      fromUrl: "http://127.0.0.1:3000/",
      maxDepth: 1,
    });

    expect(urls).toEqual([
      "http://127.0.0.1:3000/",
      "http://127.0.0.1:3000/a",
      "http://127.0.0.1:3000/b",
      "http://127.0.0.1:3000/c",
    ]);
  });

  test("getUrls - depth 2", async () => {
    const browser = await getBrowser();
    const urls = await getUrls({
      context: await browser.newContext(),
      fromUrl: "http://127.0.0.1:3000/",
      maxDepth: 2,
    });

    expect(urls).toEqual([
      "http://127.0.0.1:3000/",
      "http://127.0.0.1:3000/a",
      "http://127.0.0.1:3000/a-a",
      "http://127.0.0.1:3000/b",
      "http://127.0.0.1:3000/b-a",
      "http://127.0.0.1:3000/c",
      "http://127.0.0.1:3000/c-a",
    ]);
  });

  test("getContent", async () => {
    const browser = await getBrowser();
    const content = await getContent({
      context: await browser.newContext(),
      url: "http://127.0.0.1:3000/",
      selector: "main",
    });
    expect(content).toBe("helloabc");
  });
});
