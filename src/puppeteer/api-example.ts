/**
 * Elysia API Example for PDF Generation from Next.js App
 *
 * This file demonstrates how to create API endpoints that generate PDFs
 * from your Next.js assessment result page with localStorage data
 *
 * Usage in your main app:
 * import { assessmentPDFRoutes } from './puppeteer/api-example';
 * app.use(assessmentPDFRoutes);
 */

import { Elysia, t } from "elysia";
import { PuppeteerService } from "./service";
import { getPuppeteerManager } from "./index";

/**
 * Define the expected structure of assessment data
 * Adjust this to match your actual data structure
 */
const AssessmentDataSchema = t.Object({
  userId: t.String(),
  assessmentId: t.String(),
  userInfo: t.Optional(
    t.Object({
      name: t.String(),
      email: t.String(),
      studentId: t.Optional(t.String()),
    }),
  ),
  answers: t.Optional(t.Array(t.Any())),
  results: t.Optional(t.Any()),
  completedAt: t.Optional(t.String()),
  // Add any other fields your Next.js app needs
});

/**
 * Main PDF generation routes
 */
export const assessmentPDFRoutes = new Elysia({ prefix: "/api/pdf" })
  /**
   * POST /api/pdf/generate
   * Generate PDF from assessment data
   *
   * Body: { assessmentData: { userId, assessmentId, ... } }
   * Returns: PDF file
   */
  .post(
    "/generate",
    async ({ body, set }) => {
      try {
        const { assessmentData, options } = body;

        // Generate PDF using the service
        const pdf = await PuppeteerService.generateNextJSPDF({
          url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
          localStorageData: assessmentData,
          format: options?.format || "A4",
          landscape: options?.landscape || false,
          printBackground: true,
          waitForSelector: "body", // Adjust to your content selector
          waitForTimeout: options?.waitTimeout || 3000,
          viewport: options?.viewport,
          hideHeaderFooter: options?.hideHeaderFooter ?? true,
          margin: options?.margin || {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
          },
        });

        // Set response headers for PDF download
        set.headers["Content-Type"] = "application/pdf";
        set.headers["Content-Disposition"] =
          `attachment; filename="assessment-${assessmentData.userId}-${Date.now()}.pdf"`;

        return new Response(pdf as BodyInit);
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to generate PDF",
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        assessmentData: t.Any(), // Use AssessmentDataSchema for strict validation
        options: t.Optional(
          t.Object({
            format: t.Optional(
              t.Union([
                t.Literal("A4"),
                t.Literal("Letter"),
                t.Literal("Legal"),
              ]),
            ),
            landscape: t.Optional(t.Boolean()),
            waitTimeout: t.Optional(t.Number()),
            viewport: t.Optional(
              t.Object({
                width: t.Number(),
                height: t.Number(),
              }),
            ),
            hideHeaderFooter: t.Optional(t.Boolean()),
            margin: t.Optional(
              t.Object({
                top: t.Optional(t.String()),
                right: t.Optional(t.String()),
                bottom: t.Optional(t.String()),
                left: t.Optional(t.String()),
              }),
            ),
          }),
        ),
      }),
    },
  )

  /**
   * GET /api/pdf/generate/:userId/:assessmentId
   * Generate PDF by fetching data from database
   *
   * This assumes you have assessment data stored in your database
   */
  .get(
    "/generate/:userId/:assessmentId",
    async ({ params, query, set }) => {
      try {
        const { userId, assessmentId } = params;

        // TODO: Fetch assessment data from your database
        // const assessmentData = await db.query.assessments.findFirst({
        //   where: (assessments, { eq, and }) =>
        //     and(
        //       eq(assessments.userId, userId),
        //       eq(assessments.id, assessmentId)
        //     ),
        // });

        // For this example, we'll create mock data
        const assessmentData = {
          userId,
          assessmentId,
          userInfo: {
            name: "Sample User",
            email: "user@example.com",
          },
          answers: [],
          results: {},
          completedAt: new Date().toISOString(),
        };

        // Generate PDF
        const pdf = await PuppeteerService.generateNextJSPDF({
          url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
          localStorageData: assessmentData,
          format: (query.format as any) || "A4",
          landscape: query.landscape === "true",
          printBackground: true,
          waitForSelector: "body",
          waitForTimeout: 3000,
          hideHeaderFooter: true,
        });

        set.headers["Content-Type"] = "application/pdf";
        set.headers["Content-Disposition"] =
          `attachment; filename="assessment-${userId}-${assessmentId}.pdf"`;

        return new Response(pdf as BodyInit);
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to generate PDF",
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      params: t.Object({
        userId: t.String(),
        assessmentId: t.String(),
      }),
      query: t.Object({
        format: t.Optional(t.String()),
        landscape: t.Optional(t.String()),
      }),
    },
  )

  /**
   * POST /api/pdf/screenshot
   * Generate screenshot instead of PDF
   */
  .post(
    "/screenshot",
    async ({ body, set }) => {
      try {
        const { assessmentData } = body;

        const screenshot = await PuppeteerService.screenshotNextJSApp(
          "http://localhost:3001/assessment/talenta-mahasiswa/result",
          assessmentData,
          {
            fullPage: true,
            waitForSelector: "body",
            waitForTimeout: 3000,
            hideHeaderFooter: true,
          },
        );

        set.headers["Content-Type"] = "image/png";
        set.headers["Content-Disposition"] =
          `attachment; filename="assessment-${assessmentData.userId}-${Date.now()}.png"`;

        return new Response(screenshot as BodyInit);
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to generate screenshot",
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        assessmentData: t.Any(),
      }),
    },
  )

  /**
   * POST /api/pdf/batch
   * Generate PDFs for multiple assessments
   */
  .post(
    "/batch",
    async ({ body, set }) => {
      try {
        const { assessments } = body;

        const results = await Promise.all(
          assessments.map(async (assessment: any) => {
            try {
              const pdf = await PuppeteerService.generateNextJSPDF({
                url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
                localStorageData: assessment.data,
                format: "A4",
                printBackground: true,
                waitForSelector: "body",
                waitForTimeout: 2000,
                hideHeaderFooter: true,
              });

              return {
                userId: assessment.userId,
                success: true,
                size: pdf.length,
              };
            } catch (error) {
              return {
                userId: assessment.userId,
                success: false,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          }),
        );

        return {
          total: assessments.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
          results,
        };
      } catch (error) {
        set.status = 500;
        return {
          error: "Failed to generate batch PDFs",
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        assessments: t.Array(
          t.Object({
            userId: t.String(),
            data: t.Any(),
          }),
        ),
      }),
    },
  )

  /**
   * GET /api/pdf/health
   * Check if Puppeteer service is healthy
   */
  .get("/health", async ({ set }) => {
    try {
      const manager = getPuppeteerManager();
      const stats = manager.getStats();

      return {
        status: "healthy",
        connected: stats.isConnected,
        activeContexts: stats.activeContexts,
        maxContexts: stats.maxContexts,
      };
    } catch (error) {
      set.status = 500;
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })

  /**
   * POST /api/pdf/test
   * Test endpoint with sample data
   */
  .post("/test", async ({ set }) => {
    try {
      // Sample test data
      const testData = {
        userId: "test-user-123",
        assessmentId: "assessment-456",
        userInfo: {
          name: "Test User",
          email: "test@example.com",
          studentId: "1234567890",
        },
        answers: [
          { questionId: 1, answer: "A", score: 5 },
          { questionId: 2, answer: "B", score: 4 },
          { questionId: 3, answer: "C", score: 3 },
        ],
        results: {
          totalScore: 12,
          maxScore: 15,
          percentage: 80,
          category: "High Potential",
          strengths: ["Leadership", "Communication", "Problem Solving"],
          weaknesses: ["Time Management"],
          recommendations: [
            "Continue developing technical skills",
            "Focus on time management techniques",
          ],
        },
        completedAt: new Date().toISOString(),
      };

      const pdf = await PuppeteerService.generateNextJSPDF({
        url: "http://localhost:3001/assessment/talenta-mahasiswa/result",
        localStorageData: testData,
        format: "A4",
        landscape: false,
        printBackground: true,
        waitForSelector: "body",
        waitForTimeout: 3000,
        viewport: { width: 1920, height: 1080 },
        hideHeaderFooter: true,
      });

      set.headers["Content-Type"] = "application/pdf";
      set.headers["Content-Disposition"] =
        `attachment; filename="test-assessment.pdf"`;

      return new Response(pdf as BodyInit);
    } catch (error) {
      set.status = 500;
      return {
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  });

/**
 * Example usage in your main Elysia app:
 *
 * import { Elysia } from 'elysia';
 * import { assessmentPDFRoutes } from './puppeteer/api-example';
 *
 * const app = new Elysia()
 *   .use(assessmentPDFRoutes)
 *   .listen(3000);
 *
 * // Then you can call:
 * // POST http://localhost:3000/api/pdf/generate
 * // GET  http://localhost:3000/api/pdf/generate/:userId/:assessmentId
 * // POST http://localhost:3000/api/pdf/screenshot
 * // POST http://localhost:3000/api/pdf/batch
 * // GET  http://localhost:3000/api/pdf/health
 * // POST http://localhost:3000/api/pdf/test
 */

/**
 * Cleanup on server shutdown
 */
export async function cleanupPuppeteer() {
  const manager = getPuppeteerManager();
  await manager.close();
}

// Register cleanup handler
if (typeof process !== "undefined") {
  process.on("SIGTERM", cleanupPuppeteer);
  process.on("SIGINT", cleanupPuppeteer);
}
