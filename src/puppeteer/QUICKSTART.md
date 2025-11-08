# Puppeteer Manager - Quick Start Guide

Get started with the reusable, efficient, and lightweight Puppeteer instance in under 5 minutes!

## 🚀 Installation

Dependencies are already installed in the project. Just import and use!

```typescript
import { getPuppeteerManager } from './puppeteer';
```

## 📝 Basic Usage

### 1. Simple Screenshot (Most Common)

```typescript
import { getPuppeteerManager } from './puppeteer';

const manager = getPuppeteerManager();

// Automatically handles cleanup
const screenshot = await manager.withPage(async (page) => {
  await page.goto('https://example.com');
  return await page.screenshot();
});
```

### 2. Using the Service Layer (Recommended)

```typescript
import { PuppeteerService } from './puppeteer/service';

// Take a screenshot
const screenshot = await PuppeteerService.takeScreenshot({
  url: 'https://example.com',
  fullPage: true
});

// Generate PDF
const pdf = await PuppeteerService.generatePDF({
  url: 'https://example.com',
  format: 'A4'
});

// Scrape HTML
const html = await PuppeteerService.scrapeHTML({
  url: 'https://example.com',
  blockResources: true // Faster scraping
});
```

## 🎯 Common Use Cases

### Scrape Data from a Page

```typescript
const data = await manager.withPage(async (page) => {
  await page.goto('https://example.com/products');
  
  return await page.evaluate(() => {
    const products = [];
    document.querySelectorAll('.product').forEach(el => {
      products.push({
        title: el.querySelector('.title')?.textContent,
        price: el.querySelector('.price')?.textContent
      });
    });
    return products;
  });
});
```

### Multiple Pages in Parallel

```typescript
const urls = ['https://site1.com', 'https://site2.com', 'https://site3.com'];

const results = await Promise.all(
  urls.map(url => 
    manager.withPage(async (page) => {
      await page.goto(url);
      return await page.title();
    })
  )
);
```

### Login and Scrape Protected Content

```typescript
await manager.withContext(async (context) => {
  const page = await context.newPage();
  
  // Login
  await page.goto('https://example.com/login');
  await page.type('#username', 'user@example.com');
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  // Cookies are preserved in this context
  await page.goto('https://example.com/dashboard');
  const data = await page.content();
  
  await page.close();
  return data;
});
```

### Mobile Screenshot

```typescript
const screenshot = await PuppeteerService.takeMobileScreenshot(
  'https://example.com',
  'iphone' // or 'android'
);
```

## 🎨 Integration with Elysia API

```typescript
import { Elysia } from 'elysia';
import { PuppeteerService } from './puppeteer/service';

const app = new Elysia()
  .get('/api/screenshot', async ({ query }) => {
    const screenshot = await PuppeteerService.takeScreenshot({
      url: query.url,
      fullPage: true
    });
    
    return new Response(screenshot, {
      headers: { 'Content-Type': 'image/png' }
    });
  })
  .get('/api/pdf', async ({ query }) => {
    const pdf = await PuppeteerService.generatePDF({
      url: query.url,
      format: 'A4'
    });
    
    return new Response(pdf, {
      headers: { 'Content-Type': 'application/pdf' }
    });
  })
  .post('/api/scrape', async ({ body }) => {
    const html = await PuppeteerService.scrapeHTML({
      url: body.url,
      blockResources: true
    });
    
    return { html };
  })
  .listen(3000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  const manager = getPuppeteerManager();
  await manager.close();
  app.stop();
});
```

## ⚙️ Configuration

```typescript
const manager = getPuppeteerManager({
  maxContexts: 10,      // Max concurrent contexts
  timeout: 60000,       // Default timeout (60s)
  enableLogging: true,  // Enable debug logs
  launchOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
});
```

## 🧪 Testing

Run the demo to verify everything works:

```bash
bun run src/puppeteer/demo.ts
```

## 💡 Pro Tips

### 1. Always Use `withPage` or `withContext`
These methods automatically clean up resources:

```typescript
// ✅ Good - automatic cleanup
await manager.withPage(async (page) => {
  // Your code
});

// ❌ Bad - manual cleanup required
const { page, context } = await manager.getPage();
// Must remember to close!
await manager.closeContext(context);
```

### 2. Block Resources for Faster Scraping

```typescript
await manager.withPage(async (page) => {
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
  
  await page.goto(url); // Much faster!
});
```

### 3. Handle Errors Gracefully

```typescript
try {
  await manager.withPage(async (page) => {
    page.setDefaultTimeout(15000);
    await page.goto(url);
    return await page.content();
  });
} catch (error) {
  console.error('Scraping failed:', error);
  // Handle error appropriately
}
```

### 4. Use Appropriate Wait Strategies

```typescript
// Fast but may not be fully loaded
await page.goto(url, { waitUntil: 'domcontentloaded' });

// Balanced
await page.goto(url, { waitUntil: 'networkidle2' });

// Slowest but most complete
await page.goto(url, { waitUntil: 'networkidle0' });
```

## 📊 Check Status

```typescript
const stats = manager.getStats();
console.log({
  connected: stats.isConnected,
  activeContexts: stats.activeContexts,
  maxContexts: stats.maxContexts
});
```

## 🧹 Cleanup

```typescript
// Close all contexts
await manager.closeAllContexts();

// Close entire browser
await manager.close();
```

## 🔗 Next Steps

- See [README.md](./README.md) for complete API documentation
- Check [examples.ts](./examples.ts) for 15+ usage examples
- Explore [service.ts](./service.ts) for high-level service methods
- Run [demo.ts](./demo.ts) to see it in action

## 🆘 Troubleshooting

**Browser won't start?**
- Check if Chromium dependencies are installed
- On Linux: `apt-get install -y chromium chromium-l10n`

**Timeout errors?**
- Increase timeout: `page.setDefaultTimeout(60000)`
- Use faster wait strategy: `waitUntil: 'domcontentloaded'`

**Memory issues?**
- Reduce `maxContexts` in configuration
- Block unnecessary resources
- Close pages after use

## 📚 Learn More

The Puppeteer manager uses:
- **Singleton Pattern**: One browser instance for the entire app
- **Context Pooling**: Isolated contexts for each operation
- **Auto-cleanup**: Resources are automatically managed
- **Lazy Initialization**: Browser starts only when needed

Happy scraping! 🎉