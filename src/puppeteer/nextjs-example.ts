/**
 * Next.js PDF Generation Examples
 *
 * This file shows how to generate PDFs from Next.js apps that require localStorage data
 * Specifically for: http://localhost:3001/assessment/talenta-mahasiswa/result
 */

import { PuppeteerService } from "./service";
import { getPuppeteerManager } from "./index";

/**
 * Example 1: Generate PDF from Next.js result page
 *
 * This is the main function you'll use for your assessment result page
 */
export async function generateAssessmentResultPDF(
  assessmentData: {
    // Add your assessment data structure here
    userId?: string;
    answers?: any[];
    results?: any;
    timestamp?: string;
    // Add any other data your Next.js app needs from localStorage
    [key: string]: any;
  },
  pdfOptions?: {
    format?: "A4" | "Letter" | "Legal";
    landscape?: boolean;
  },
): Promise<Uint8Array> {
  const pdf = await PuppeteerService.generateNextJSPDF({
    url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
    localStorageData: assessmentData,
    format: pdfOptions?.format || "A4",
    landscape: pdfOptions?.landscape || false,
    printBackground: true,
    // Wait for the main content to load
    // Wait for all content to render
    waitForSelector: "body", // Change this to your actual content selector
    // Additional wait time for charts, animations, etc.
    waitForTimeout: 2000,
    // Set custom viewport size
    viewport: {
      width: 1920,
      height: 1080,
    },
    // Automatically hide header and footer
    hideHeaderFooter: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  return pdf;
}

/**
 * Example 2: Generate PDF with specific localStorage structure
 *
 * If your Next.js app uses specific localStorage keys
 */
export async function generateResultPDFWithLocalStorage(localStorageData: {
  assessmentId: string;
  userId: string;
  userAnswers: any[];
  calculatedResults: any;
  completedAt: string;
}): Promise<Uint8Array> {
  // Structure your localStorage data exactly as your Next.js app expects
  const storageData = {
    "assessment-data": JSON.stringify(localStorageData),
    // Or if you store them separately:
    // "assessmentId": localStorageData.assessmentId,
    // "userAnswers": JSON.stringify(localStorageData.userAnswers),
    // "results": JSON.stringify(localStorageData.calculatedResults),
  };

  const pdf = await PuppeteerService.generateNextJSPDF({
    url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
    localStorageData: storageData,
    format: "A4",
    printBackground: true,
    waitForSelector: ".result-container", // Wait for your result container
    waitForTimeout: 3000, // Wait 3 seconds for all content to render
    viewport: {
      width: 1920,
      height: 1080,
    },
    hideHeaderFooter: true, // Automatically hide header and footer
  });

  return pdf;
}

/**
 * Example 3: Advanced - Generate PDF with custom wait logic
 *
 * For pages with complex rendering (charts, animations, API calls)
 */
export async function generateAdvancedPDF(
  assessmentData: any,
): Promise<Uint8Array> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    // Navigate to the page
    await page.goto(
      "http://localhost:3001/assessment/talenta-mahasiswa/result",
      {
        waitUntil: "domcontentloaded",
      },
    );

    // Inject localStorage data
    await page.evaluate((data) => {
      // Clear existing localStorage first (optional)
      localStorage.clear();

      // Set all your data
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(
          key,
          typeof value === "string" ? value : JSON.stringify(value),
        );
      }
    }, assessmentData);

    // Reload the page to apply localStorage
    await page.reload({ waitUntil: "networkidle0" });

    // Wait for specific elements to be visible
    await page.waitForSelector(".result-header", { timeout: 30000 });
    await page.waitForSelector(".result-summary", { timeout: 30000 });

    // Wait for any charts or graphs to render
    await page.waitForFunction(
      () => {
        // Check if charts are rendered (adjust selector to your needs)
        const charts = document.querySelectorAll("canvas, svg");
        return charts.length > 0;
      },
      { timeout: 10000 },
    );

    // Additional wait for animations to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Optional: Hide elements you don't want in the PDF
    await page.evaluate(() => {
      // Hide navigation, buttons, header, footer, etc.
      const elementsToHide = document.querySelectorAll(
        "header, footer, .no-print, .navigation, button, .back-button",
      );
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    });

    // Generate PDF
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true, // Respect CSS @page rules
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });
  });
}

/**
 * Example 4: Screenshot instead of PDF
 *
 * Sometimes a screenshot is better than PDF
 */
export async function takeResultScreenshot(
  assessmentData: any,
): Promise<Buffer> {
  const screenshot = await PuppeteerService.screenshotNextJSApp(
    "http://localhost:3001/assessment/talenta-mahasiswa/result",
    assessmentData,
    {
      fullPage: true,
      waitForSelector: ".result-container",
      waitForTimeout: 2000,
      viewport: {
        width: 1920,
        height: 1080,
      },
      hideHeaderFooter: true,
    },
  );

  return screenshot;
}

/**
 * Example 5: Integration with Elysia API endpoint
 *
 * How to use this in your backend API
 */
export function createPDFEndpoint() {
  // This is example code for your API routes
  return {
    handler: async (request: any) => {
      // Get assessment data from request body or database
      const assessmentData = {
        userId: request.body.userId,
        assessmentId: request.body.assessmentId,
        answers: request.body.answers,
        results: request.body.results,
        timestamp: new Date().toISOString(),
      };

      // Generate PDF with custom viewport and hidden header/footer
      const pdf = await generateAssessmentResultPDF(assessmentData, {
        format: "A4",
        landscape: false,
      });

      // Return as response
      return new Response(pdf as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="assessment-result-${assessmentData.userId}.pdf"`,
        },
      });
    },
  };
}

/**
 * Example 6: Batch generation - Generate PDFs for multiple users
 */
export async function generateBatchPDFs(
  assessments: Array<{
    userId: string;
    data: any;
  }>,
): Promise<Array<{ userId: string; pdf: Uint8Array }>> {
  const results = await Promise.all(
    assessments.map(async ({ userId, data }) => {
      const pdf = await generateAssessmentResultPDF(data);
      return { userId, pdf };
    }),
  );

  return results;
}

/**
 * Example 7: Debug mode - Save HTML before generating PDF
 *
 * Useful for debugging what the page looks like before PDF generation
 */
export async function generatePDFWithDebug(
  assessmentData: any,
): Promise<{ pdf: Uint8Array; html: string }> {
  const manager = getPuppeteerManager();

  return await manager.withPage(async (page) => {
    await page.goto(
      "http://localhost:3001/assessment/talenta-mahasiswa/result",
    );

    // Inject localStorage
    await page.evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(
          key,
          typeof value === "string" ? value : JSON.stringify(value),
        );
      }
    }, assessmentData);

    // Reload
    await page.reload({ waitUntil: "networkidle0" });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get HTML for debugging
    const html = await page.content();

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    return { pdf, html };
  });
}

/**
 * Example 8: Realistic usage in your backend
 */
export async function generatePDFForUser(
  userId: string,
  assessmentId: string,
): Promise<Uint8Array> {
  // 1. Fetch assessment data from your database
  // const assessmentData = await db.getAssessmentData(userId, assessmentId);

  // 2. For this example, let's create mock data
  const assessmentData = {
    // This should match what your Next.js app expects in localStorage
    userId: userId,
    assessmentId: assessmentId,
    userInfo: {
      name: "John Doe",
      email: "john@example.com",
    },
    answers: [
      { questionId: 1, answer: "A" },
      { questionId: 2, answer: "B" },
      // ... more answers
    ],
    results: {
      score: 85,
      category: "High Potential",
      strengths: ["Leadership", "Communication"],
      recommendations: ["Continue developing technical skills"],
    },
    completedAt: new Date().toISOString(),
  };

  // 3. Generate PDF
  const pdf = await PuppeteerService.generateNextJSPDF({
    url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
    localStorageData: assessmentData,
    format: "A4",
    landscape: false,
    printBackground: true,
    waitForSelector: "body", // Adjust to your actual content selector
    waitForTimeout: 3000, // Wait for everything to render
    viewport: {
      width: 1920,
      height: 1080,
    },
    hideHeaderFooter: true, // Remove header and footer elements
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  return pdf;
}

/**
 * PRO TIP: To find the right selector to wait for:
 *
 * 1. Open your Next.js app in Chrome DevTools
 * 2. Check what elements are rendered after localStorage is loaded
 * 3. Use that selector in `waitForSelector`
 *
 * Common selectors:
 * - ".result-container"
 * - "#assessment-result"
 * - "[data-testid='result-page']"
 * - ".chart-container"
 */

/**
 * PRO TIP 2: Determine the right localStorage structure:
 *
 * 1. Open your Next.js app: http://localhost:3001/assessment/talenta-mahasiswa/result
 * 2. Open Chrome DevTools > Application > Local Storage
 * 3. Note down all the keys and their structure
 * 4. Use the same structure when calling generateNextJSPDF
 */
