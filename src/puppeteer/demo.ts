/**
 * Demo file for Puppeteer Manager
 *
 * This file demonstrates the usage of the Puppeteer manager
 * Run with: bun run src/puppeteer/demo.ts
 */

import { getPuppeteerManager } from "./index";

async function demo() {
  console.log("🚀 Starting Puppeteer Manager Demo\n");

  const manager = getPuppeteerManager({
    enableLogging: true,
    maxContexts: 3,
    timeout: 30000,
  });

  try {
    // Demo 1: Simple screenshot
    console.log("📸 Demo 1: Taking screenshot of example.com");
    const screenshot = await manager.withPage(async (page) => {
      await page.goto("https://example.com", { waitUntil: "networkidle2" });
      console.log("✅ Page loaded:", await page.title());
      return await page.screenshot({ fullPage: true });
    });
    console.log(`✅ Screenshot taken: ${screenshot.length} bytes\n`);

    // Demo 2: Extract data
    console.log("🔍 Demo 2: Extracting data from example.com");
    const data = await manager.withPage(async (page) => {
      await page.goto("https://example.com");
      const info = await page.evaluate(() => ({
        title: document.title,
        heading: document.querySelector("h1")?.textContent,
        paragraphs: Array.from(document.querySelectorAll("p")).map(
          (p) => p.textContent,
        ),
      }));
      return info;
    });
    console.log("✅ Data extracted:", JSON.stringify(data, null, 2), "\n");

    // Demo 3: Multiple pages in parallel
    console.log("⚡ Demo 3: Scraping multiple pages in parallel");
    const urls = [
      "https://example.com",
      "https://example.org",
      "https://example.net",
    ];

    const titles = await Promise.all(
      urls.map((url) =>
        manager.withPage(async (page) => {
          await page.goto(url, { waitUntil: "domcontentloaded" });
          return {
            url,
            title: await page.title(),
          };
        }),
      ),
    );
    console.log("✅ Titles extracted:");
    titles.forEach(({ url, title }) => console.log(`  - ${url}: ${title}`));
    console.log();

    // Demo 4: Get manager statistics
    console.log("📊 Demo 4: Manager statistics");
    const stats = manager.getStats();
    console.log("✅ Stats:", stats, "\n");

    // Demo 5: Using context for multiple pages
    console.log("🔗 Demo 5: Multiple pages in same context");
    await manager.withContext(async (context) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto("https://example.com");
      await page2.goto("https://example.org");

      console.log("✅ Page 1:", await page1.title());
      console.log("✅ Page 2:", await page2.title());

      await page1.close();
      await page2.close();
    });
    console.log();

    // Demo 6: PDF generation
    console.log("📄 Demo 6: Generating PDF");
    const pdf = await manager.withPage(async (page) => {
      await page.goto("https://example.com", { waitUntil: "networkidle0" });
      return await page.pdf({
        format: "A4",
        printBackground: true,
      });
    });
    console.log(`✅ PDF generated: ${pdf.length} bytes\n`);

    console.log("✨ All demos completed successfully!");
  } catch (error) {
    console.error("❌ Error during demo:", error);
  } finally {
    // Cleanup
    console.log("\n🧹 Cleaning up...");
    await manager.close();
    console.log("✅ Cleanup complete");
  }
}

// Run the demo
if (import.meta.main) {
  demo()
    .then(() => {
      console.log("\n✅ Demo finished successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Demo failed:", error);
      process.exit(1);
    });
}

export { demo };
