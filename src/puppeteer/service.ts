/**
 * Puppeteer Service Layer
 *
 * Provides high-level, reusable functions for common browser automation tasks
 * Built on top of the PuppeteerManager for efficient resource management
 */

import { getPuppeteerManager } from "./index";
import type {
  LaunchOptions,
  Page,
  PDFOptions,
  ScreenshotOptions,
} from "puppeteer";

/**
 * Screenshot service options
 */
export interface ScreenshotServiceOptions {
  url: string;
  fullPage?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  delay?: number;
}

/**
 * PDF generation options
 */
export interface PDFServiceOptions {
  url: string;
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
}

/**
 * Web scraping options
 */
export interface ScrapeOptions {
  url: string;
  waitForSelector?: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  timeout?: number;
  blockResources?: boolean;
}

/**
 * HTML to PDF conversion options
 */
export interface HTMLToPDFOptions {
  html: string;
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  printBackground?: boolean;
}

/**
 * Next.js PDF generation options
 */
export interface NextJSPDFOptions {
  url: string;
  localStorageData: Record<string, any>;
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  printBackground?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
  hideHeaderFooter?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Puppeteer Service Class
 * Provides convenient methods for common browser automation tasks
 */
export class PuppeteerService {
  /**
   * Take a screenshot of a webpage
   */
  static async takeScreenshot(
    options: ScreenshotServiceOptions,
  ): Promise<Buffer> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      // Set viewport if specified
      if (options.viewport) {
        await page.setViewport(options.viewport);
      }

      // Navigate to URL
      await page.goto(options.url, {
        waitUntil: options.waitUntil || "networkidle2",
      });

      // Optional delay
      if (options.delay) {
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }

      // Take screenshot
      const screenshotOptions: ScreenshotOptions = {
        fullPage: options.fullPage ?? true,
      };

      const screenshot = await page.screenshot(screenshotOptions);
      return screenshot as Buffer;
    });
  }

  /**
   * Generate PDF from a webpage
   */
  static async generatePDF(options: PDFServiceOptions): Promise<Uint8Array> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.goto(options.url, {
        waitUntil: options.waitUntil || "networkidle0",
      });

      const pdfOptions: PDFOptions = {
        format: options.format || "A4",
        landscape: options.landscape || false,
        printBackground: options.printBackground ?? true,
        margin: options.margin || {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      };

      return await page.pdf(pdfOptions);
    });
  }

  /**
   * Scrape HTML content from a webpage
   */
  static async scrapeHTML(options: ScrapeOptions): Promise<string> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      // Set timeout if specified
      if (options.timeout) {
        page.setDefaultTimeout(options.timeout);
      }

      // Block resources if requested
      if (options.blockResources) {
        await page.setRequestInterception(true);
        page.on("request", (req) => {
          const resourceType = req.resourceType();
          if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
            req.abort();
          } else {
            req.continue();
          }
        });
      }

      // Navigate to URL
      await page.goto(options.url, {
        waitUntil: options.waitUntil || "domcontentloaded",
      });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      }

      return await page.content();
    });
  }

  /**
   * Scrape specific data from a webpage using a custom extractor function
   */
  static async scrapeData<T>(
    url: string,
    extractor: () => T,
    options?: Partial<ScrapeOptions>,
  ): Promise<T> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      // Set timeout if specified
      if (options?.timeout) {
        page.setDefaultTimeout(options.timeout);
      }

      // Block resources if requested
      if (options?.blockResources) {
        await page.setRequestInterception(true);
        page.on("request", (req) => {
          const resourceType = req.resourceType();
          if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
            req.abort();
          } else {
            req.continue();
          }
        });
      }

      await page.goto(url, {
        waitUntil: options?.waitUntil || "domcontentloaded",
      });

      if (options?.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      }

      return await page.evaluate(extractor);
    });
  }

  /**
   * Convert HTML string to PDF
   */
  static async htmlToPDF(options: HTMLToPDFOptions): Promise<Uint8Array> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.setContent(options.html);

      const pdfOptions: PDFOptions = {
        format: options.format || "A4",
        landscape: options.landscape || false,
        printBackground: options.printBackground ?? true,
      };

      return await page.pdf(pdfOptions);
    });
  }

  /**
   * Generate PDF from Next.js app with localStorage data
   * This method injects localStorage data before the page renders
   */
  static async generateNextJSPDF(
    options: NextJSPDFOptions,
  ): Promise<Uint8Array> {
    const manager = getPuppeteerManager({
      launchOptions: {
        executablePath: "/usr/bin/chromium-browser",
      },
    });

    return await manager.withPage(async (page) => {
      // Set viewport if provided
      if (options.viewport) {
        await page.setViewport({
          width: options.viewport.width,
          height: options.viewport.height,
        });
      }

      // Navigate to the page first
      await page.goto(options.url, { waitUntil: "domcontentloaded" });

      // Inject localStorage data before the app fully renders
      await page.evaluate((data) => {
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(
            key,
            typeof value === "string" ? value : JSON.stringify(value),
          );
        }
      }, options.localStorageData);

      // Reload the page so Next.js can read the localStorage data
      await page.reload({ waitUntil: "networkidle0" });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 30000,
        });
      }

      // Additional wait time for dynamic content
      if (options.waitForTimeout) {
        await new Promise((resolve) =>
          setTimeout(resolve, options.waitForTimeout),
        );
      }

      // Hide header and footer elements if requested
      if (options.hideHeaderFooter ?? true) {
        await page.evaluate(() => {
          document.querySelectorAll("header").forEach((el) => el.remove());
          document.querySelectorAll("footer").forEach((el) => el.remove());
          document.querySelectorAll("button").forEach((btn) => {
            if (btn.textContent.trim().includes("Kembali")) {
              btn.remove();
            }
            if (btn.textContent.trim().includes("Unduh PDF")) {
              btn.remove();
            }
          });
        });
      }

      // Generate PDF
      const pdfOptions: PDFOptions = {
        format: options.format || "A4",
        landscape: options.landscape || false,
        printBackground: options.printBackground ?? true,
        margin: options.margin || {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      };

      return await page.pdf(pdfOptions);
    });
  }

  /**
   * Take screenshot of Next.js app with localStorage data
   */
  static async screenshotNextJSApp(
    url: string,
    localStorageData: Record<string, any>,
    options?: {
      fullPage?: boolean;
      waitForSelector?: string;
      waitForTimeout?: number;
      viewport?: {
        width: number;
        height: number;
      };
      hideHeaderFooter?: boolean;
    },
  ): Promise<Buffer> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      // Set viewport if provided
      if (options?.viewport) {
        await page.setViewport({
          width: options.viewport.width,
          height: options.viewport.height,
        });
      }

      // Navigate to the page
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Inject localStorage data
      await page.evaluate((data) => {
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(
            key,
            typeof value === "string" ? value : JSON.stringify(value),
          );
        }
      }, localStorageData);

      // Reload to apply localStorage
      await page.reload({ waitUntil: "networkidle2" });

      // Wait for specific selector if provided
      if (options?.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 30000,
        });
      }

      // Additional wait time
      if (options?.waitForTimeout) {
        await new Promise((resolve) =>
          setTimeout(resolve, options.waitForTimeout),
        );
      }

      // Hide header and footer elements if requested
      if (options?.hideHeaderFooter ?? true) {
        await page.evaluate(() => {
          const headers = document.querySelectorAll("header");
          const footers = document.querySelectorAll("footer");
          headers.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
          footers.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        });
      }

      const screenshot = await page.screenshot({
        fullPage: options?.fullPage ?? true,
      });
      return screenshot as Buffer;
    });
  }

  /**
   * Scrape multiple URLs in parallel
   */
  static async scrapeMultiple<T>(
    urls: string[],
    extractor: (page: Page) => Promise<T>,
  ): Promise<T[]> {
    const manager = getPuppeteerManager();

    const promises = urls.map((url) =>
      manager.withPage(async (page) => {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        return await extractor(page);
      }),
    );

    return await Promise.all(promises);
  }

  /**
   * Take a mobile screenshot
   */
  static async takeMobileScreenshot(
    url: string,
    device: "iphone" | "android" = "iphone",
  ): Promise<Buffer> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      // Set mobile viewport
      const viewport =
        device === "iphone"
          ? {
              width: 375,
              height: 812,
              deviceScaleFactor: 3,
              isMobile: true,
              hasTouch: true,
            }
          : {
              width: 360,
              height: 800,
              deviceScaleFactor: 2,
              isMobile: true,
              hasTouch: true,
            };

      await page.setViewport(viewport);

      // Set mobile user agent
      const userAgent =
        device === "iphone"
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
          : "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36";

      await page.setUserAgent(userAgent);

      await page.goto(url, { waitUntil: "networkidle2" });

      const screenshot = await page.screenshot({ fullPage: true });
      return screenshot as Buffer;
    });
  }

  /**
   * Test if a webpage loads successfully
   */
  static async testPageLoad(url: string): Promise<{
    success: boolean;
    statusCode: number | null;
    title: string | null;
    loadTime: number;
    error?: string;
  }> {
    const manager = getPuppeteerManager();
    const startTime = Date.now();

    try {
      return await manager.withPage(async (page) => {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
        });

        const loadTime = Date.now() - startTime;
        const statusCode = response?.status() || null;
        const title = await page.title();

        return {
          success: statusCode !== null && statusCode < 400,
          statusCode,
          title,
          loadTime,
        };
      });
    } catch (error) {
      const loadTime = Date.now() - startTime;
      return {
        success: false,
        statusCode: null,
        title: null,
        loadTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute custom JavaScript on a page
   */
  static async executeScript<T>(
    url: string,
    script: string | (() => T),
  ): Promise<T> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      if (typeof script === "string") {
        return (await page.evaluate(script)) as T;
      } else {
        return await page.evaluate(script);
      }
    });
  }

  /**
   * Fill and submit a form
   */
  static async submitForm(
    url: string,
    formData: Record<string, string>,
    submitSelector: string = 'button[type="submit"]',
  ): Promise<{
    success: boolean;
    finalUrl: string;
    content: string;
  }> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.goto(url, { waitUntil: "networkidle2" });

      // Fill form fields
      for (const [selector, value] of Object.entries(formData)) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.type(selector, value);
        } catch (error) {
          throw new Error(`Failed to fill field ${selector}: ${error}`);
        }
      }

      // Submit form and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
        page.click(submitSelector),
      ]);

      return {
        success: true,
        finalUrl: page.url(),
        content: await page.content(),
      };
    });
  }

  /**
   * Get page performance metrics
   */
  static async getPerformanceMetrics(url: string): Promise<{
    timing: any;
    metrics: any;
  }> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.goto(url, { waitUntil: "networkidle2" });

      const timing = await page.evaluate(() => {
        const perf = window.performance.timing;
        return {
          navigationStart: perf.navigationStart,
          domContentLoadedEventEnd: perf.domContentLoadedEventEnd,
          loadEventEnd: perf.loadEventEnd,
          domComplete: perf.domComplete,
        };
      });

      const metrics = await page.metrics();

      return { timing, metrics };
    });
  }

  /**
   * Wait for element and extract its content
   */
  static async waitForElement(
    url: string,
    selector: string,
    timeout: number = 30000,
  ): Promise<string | null> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      page.setDefaultTimeout(timeout);
      await page.goto(url, { waitUntil: "domcontentloaded" });

      await page.waitForSelector(selector);

      return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element ? element.textContent : null;
      }, selector);
    });
  }

  /**
   * Get all links from a webpage
   */
  static async extractLinks(url: string): Promise<string[]> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      return await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]")).map(
          (a) => (a as HTMLAnchorElement).href,
        );
      });
    });
  }

  /**
   * Extract meta tags from a webpage
   */
  static async extractMetaTags(url: string): Promise<Record<string, string>> {
    const manager = getPuppeteerManager();

    return await manager.withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      return await page.evaluate(() => {
        const metaTags: Record<string, string> = {};

        // Get all meta tags
        document.querySelectorAll("meta").forEach((meta) => {
          const name =
            meta.getAttribute("name") ||
            meta.getAttribute("property") ||
            meta.getAttribute("http-equiv");
          const content = meta.getAttribute("content");

          if (name && content) {
            metaTags[name] = content;
          }
        });

        // Add title
        metaTags["title"] = document.title;

        return metaTags;
      });
    });
  }
}

// Export convenience functions
export const {
  takeScreenshot,
  generatePDF,
  scrapeHTML,
  scrapeData,
  htmlToPDF,
  scrapeMultiple,
  takeMobileScreenshot,
  testPageLoad,
  executeScript,
  submitForm,
  getPerformanceMetrics,
  waitForElement,
  extractLinks,
  extractMetaTags,
} = PuppeteerService;

// Export default
export default PuppeteerService;
