/**
 * Usage examples for the PuppeteerManager
 *
 * This file demonstrates various ways to use the reusable Puppeteer instance
 */

import { getPuppeteerManager } from "./index";

/**
 * Example 1: Simple one-off screenshot
 * The context is automatically cleaned up after execution
 */
export async function takeScreenshot(url: string): Promise<Buffer> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    await page.goto(url, { waitUntil: "networkidle2" });
    const screenshot = await page.screenshot({ fullPage: true });
    return screenshot as Buffer;
  });
}

/**
 * Example 2: Scrape data from multiple pages
 * Uses withContext for multiple pages in the same session
 */
export async function scrapeMultiplePages(urls: string[]): Promise<string[]> {
  const manager = getPuppeteerManager();

  return await manager.withContext(async (context) => {
    const results: string[] = [];

    for (const url of urls) {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const title = await page.title();
      results.push(title);

      await page.close();
    }

    return results;
  });
}

/**
 * Example 3: Generate PDF from HTML
 */
export async function generatePDF(url: string): Promise<Uint8Array> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    await page.goto(url, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return pdf;
  });
}

/**
 * Example 4: Fill form and submit
 */
export async function fillAndSubmitForm(
  url: string,
  formData: Record<string, string>,
): Promise<string> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Fill form fields
    for (const [selector, value] of Object.entries(formData)) {
      await page.type(selector, value);
    }

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);

    return await page.content();
  });
}

/**
 * Example 5: Extract data with complex selectors
 */
export async function extractProductInfo(url: string) {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const productInfo = await page.evaluate(() => {
      return {
        title: document.querySelector("h1.product-title")?.textContent || "",
        price: document.querySelector(".product-price")?.textContent || "",
        description:
          document.querySelector(".product-description")?.textContent || "",
        images: Array.from(document.querySelectorAll(".product-image img")).map(
          (img) => (img as HTMLImageElement).src,
        ),
      };
    });

    return productInfo;
  });
}

/**
 * Example 6: Wait for specific element and interact
 */
export async function waitAndClick(
  url: string,
  selector: string,
): Promise<void> {
  const manager = getPuppeteerManager();

  await manager.withPage(async (page) => {
    await page.goto(url);

    // Wait for element to appear
    await page.waitForSelector(selector, { timeout: 10000 });

    // Click the element
    await page.click(selector);

    // Wait for potential navigation
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
}

/**
 * Example 7: Handle authentication
 */
export async function loginAndScrape(
  loginUrl: string,
  credentials: { username: string; password: string },
  targetUrl: string,
): Promise<string> {
  const manager = getPuppeteerManager();

  return await manager.withContext(async (context) => {
    const page = await context.newPage();

    // Login
    await page.goto(loginUrl);
    await page.type("#username", credentials.username);
    await page.type("#password", credentials.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"]'),
    ]);

    // Navigate to target page (cookies are preserved in this context)
    await page.goto(targetUrl);
    const content = await page.content();

    await page.close();
    return content;
  });
}

/**
 * Example 8: Parallel scraping with multiple contexts
 */
export async function parallelScrape(urls: string[]): Promise<string[]> {
  const manager = getPuppeteerManager();

  const promises = urls.map((url) =>
    manager.withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return await page.title();
    }),
  );

  return await Promise.all(promises);
}

/**
 * Example 9: Custom viewport and device emulation
 */
export async function mobileScreenshot(url: string): Promise<Buffer> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    // Emulate mobile device
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    );

    await page.goto(url, { waitUntil: "networkidle2" });
    return (await page.screenshot({ fullPage: true })) as Buffer;
  });
}

/**
 * Example 10: Intercept and modify requests
 */
export async function blockImagesAndAds(url: string): Promise<string> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    // Enable request interception
    await page.setRequestInterception(true);

    page.on("request", (request) => {
      const resourceType = request.resourceType();
      const url = request.url();

      // Block images and ads
      if (
        resourceType === "image" ||
        url.includes("ads") ||
        url.includes("analytics")
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    return await page.content();
  });
}

/**
 * Example 11: Manual context management (advanced)
 * Use this when you need fine-grained control
 */
export async function advancedContextManagement() {
  const manager = getPuppeteerManager();

  // Get a context manually
  const context = await manager.getContext();

  try {
    const page1 = await context.newPage();
    await page1.goto("https://example.com");

    const page2 = await context.newPage();
    await page2.goto("https://example.org");

    // Do work with both pages...

    await page1.close();
    await page2.close();
  } finally {
    // Always close the context when done
    await manager.closeContext(context);
  }
}

/**
 * Example 12: Get manager statistics
 */
export async function checkManagerStats() {
  const manager = getPuppeteerManager();
  const stats = manager.getStats();

  console.log("Puppeteer Manager Stats:", {
    connected: stats.isConnected,
    activeContexts: stats.activeContexts,
    maxContexts: stats.maxContexts,
  });
}

/**
 * Example 13: Cleanup on application shutdown
 */
export async function gracefulShutdown() {
  const manager = getPuppeteerManager();

  // Close all contexts and the browser
  await manager.close();

  console.log("Puppeteer manager closed gracefully");
}

/**
 * Example 14: Initialize with custom configuration
 */
export function initializeWithCustomConfig() {
  const manager = getPuppeteerManager({
    maxContexts: 10,
    timeout: 60000,
    enableLogging: true,
    launchOptions: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    },
  });

  return manager;
}

/**
 * Example 15: Error handling
 */
export async function robustScraping(url: string): Promise<string | null> {
  const manager = getPuppeteerManager();

  try {
    return await manager.withPage(async (page) => {
      // Set timeout for this specific operation
      page.setDefaultTimeout(15000);

      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Wait for content to load
      await page.waitForSelector("body", { timeout: 5000 });

      return await page.title();
    });
  } catch (error) {
    console.error("Scraping failed:", error);
    return null;
  }
}
