# Puppeteer Manager

A reusable, efficient, and lightweight Puppeteer instance manager for Node.js/Bun applications.

## Features

✨ **Reusable** - Single browser instance with multiple isolated contexts
🆕 **Fresh** - Each operation gets a new, clean browser context
⚡ **Efficient** - Context pooling and automatic cleanup
🪶 **Lightweight** - Minimal memory footprint with optimized browser args
🔒 **Isolated** - Each context has separate cookies, cache, and storage
🧹 **Auto-cleanup** - Automatic resource management with `withPage` and `withContext`
📊 **Observable** - Built-in statistics and connection monitoring

## Installation

The required dependencies are already included in the project:

```json
{
  "puppeteer": "^24.29.1"
}
```

## Quick Start

### Basic Usage

```typescript
import { getPuppeteerManager } from './puppeteer';

// Simple screenshot
const manager = getPuppeteerManager();

const screenshot = await manager.withPage(async (page) => {
  await page.goto('https://example.com');
  return await page.screenshot();
});
```

### With Automatic Cleanup

The recommended approach using `withPage` for automatic resource management:

```typescript
const title = await manager.withPage(async (page) => {
  await page.goto('https://example.com');
  return await page.title();
});
// Context is automatically closed after execution
```

## API Reference

### `getPuppeteerManager(config?)`

Get the singleton instance of PuppeteerManager.

**Parameters:**
- `config` (optional): Configuration object

**Returns:** `PuppeteerManager` instance

### Configuration Options

```typescript
interface PuppeteerManagerConfig {
  maxContexts?: number;        // Max contexts to keep alive (default: 5)
  timeout?: number;             // Default timeout in ms (default: 30000)
  enableLogging?: boolean;      // Enable debug logging (default: false)
  launchOptions?: PuppeteerLaunchOptions; // Puppeteer launch options
}
```

### Methods

#### `withPage<T>(callback: (page: Page) => Promise<T>): Promise<T>`

Execute a function with a fresh page. Automatically creates and cleans up the context.

**Best for:** One-off operations, single page scraping, screenshots

```typescript
await manager.withPage(async (page) => {
  await page.goto('https://example.com');
  const content = await page.content();
  return content;
});
```

#### `withContext<T>(callback: (context: BrowserContext) => Promise<T>): Promise<T>`

Execute a function with a fresh context. Automatically cleans up after execution.

**Best for:** Multiple pages in same session, maintaining state across pages

```typescript
await manager.withContext(async (context) => {
  const page1 = await context.newPage();
  const page2 = await context.newPage();
  
  // Both pages share cookies and storage
  await page1.goto('https://example.com');
  await page2.goto('https://example.org');
  
  // Cleanup
  await page1.close();
  await page2.close();
});
```

#### `getPage(): Promise<{ page: Page; context: BrowserContext }>`

Get a new page in a fresh context. Manual cleanup required.

```typescript
const { page, context } = await manager.getPage();
try {
  await page.goto('https://example.com');
} finally {
  await manager.closeContext(context);
}
```

#### `getContext(): Promise<BrowserContext>`

Get a fresh browser context. Manual cleanup required.

```typescript
const context = await manager.getContext();
try {
  const page = await context.newPage();
  // Do work...
} finally {
  await manager.closeContext(context);
}
```

#### `closeContext(context: BrowserContext): Promise<void>`

Close a specific context and remove it from tracking.

#### `closeAllContexts(): Promise<void>`

Close all active contexts.

#### `close(): Promise<void>`

Close the browser and cleanup all resources.

#### `isConnected(): boolean`

Check if the browser is connected.

#### `getStats()`

Get current statistics about the manager.

```typescript
const stats = manager.getStats();
// {
//   isConnected: true,
//   activeContexts: 2,
//   maxContexts: 5
// }
```

## Usage Examples

### 1. Take Screenshot

```typescript
export async function takeScreenshot(url: string): Promise<Buffer> {
  const manager = getPuppeteerManager();
  
  return await manager.withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle2' });
    return await page.screenshot({ fullPage: true }) as Buffer;
  });
}
```

### 2. Generate PDF

```typescript
export async function generatePDF(url: string): Promise<Buffer> {
  const manager = getPuppeteerManager();
  
  return await manager.withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
  });
}
```

### 3. Scrape Data

```typescript
export async function scrapeProduct(url: string) {
  const manager = getPuppeteerManager();
  
  return await manager.withPage(async (page) => {
    await page.goto(url);
    
    return await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent,
      price: document.querySelector('.price')?.textContent,
      description: document.querySelector('.description')?.textContent
    }));
  });
}
```

### 4. Parallel Scraping

```typescript
export async function scrapeMultipleUrls(urls: string[]) {
  const manager = getPuppeteerManager();
  
  const promises = urls.map(url =>
    manager.withPage(async (page) => {
      await page.goto(url);
      return await page.title();
    })
  );
  
  return await Promise.all(promises);
}
```

### 5. Authenticated Session

```typescript
export async function scrapeAuthenticatedPage(credentials: any) {
  const manager = getPuppeteerManager();
  
  return await manager.withContext(async (context) => {
    const page = await context.newPage();
    
    // Login
    await page.goto('https://example.com/login');
    await page.type('#username', credentials.username);
    await page.type('#password', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Navigate to protected page (cookies preserved)
    await page.goto('https://example.com/dashboard');
    const data = await page.evaluate(() => document.body.textContent);
    
    await page.close();
    return data;
  });
}
```

### 6. Mobile Emulation

```typescript
export async function mobileScreenshot(url: string) {
  const manager = getPuppeteerManager();
  
  return await manager.withPage(async (page) => {
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    
    await page.goto(url);
    return await page.screenshot();
  });
}
```

### 7. Block Resources (Faster Loading)

```typescript
export async function fastScrape(url: string) {
  const manager = getPuppeteerManager();
  
  return await manager.withPage(async (page) => {
    await page.setRequestInterception(true);
    
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    await page.goto(url);
    return await page.content();
  });
}
```

## Integration with Elysia

```typescript
import { Elysia } from 'elysia';
import { getPuppeteerManager } from './puppeteer';

const app = new Elysia()
  .get('/screenshot', async ({ query }) => {
    const manager = getPuppeteerManager();
    
    const screenshot = await manager.withPage(async (page) => {
      await page.goto(query.url);
      return await page.screenshot();
    });
    
    return new Response(screenshot, {
      headers: { 'Content-Type': 'image/png' }
    });
  })
  .get('/pdf', async ({ query }) => {
    const manager = getPuppeteerManager();
    
    const pdf = await manager.withPage(async (page) => {
      await page.goto(query.url);
      return await page.pdf();
    });
    
    return new Response(pdf, {
      headers: { 'Content-Type': 'application/pdf' }
    });
  })
  .listen(3000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  const manager = getPuppeteerManager();
  await manager.close();
  app.stop();
});
```

## Best Practices

### ✅ DO

- Use `withPage` or `withContext` for automatic cleanup
- Set appropriate timeouts for your use case
- Use `setRequestInterception` to block unnecessary resources
- Handle errors gracefully
- Close the browser on application shutdown

```typescript
// Good: Automatic cleanup
await manager.withPage(async (page) => {
  await page.goto(url);
  return await page.content();
});

// Good: Error handling
try {
  await manager.withPage(async (page) => {
    // Your code
  });
} catch (error) {
  console.error('Scraping failed:', error);
}
```

### ❌ DON'T

- Don't forget to close contexts when using manual management
- Don't create too many parallel operations (respect `maxContexts`)
- Don't use the default browser context for isolated operations
- Don't keep contexts alive longer than necessary

```typescript
// Bad: No cleanup
const { page, context } = await manager.getPage();
await page.goto(url);
// Context never closed!

// Bad: Too many parallel operations
const promises = Array(100).fill(null).map(() => 
  manager.withPage(async (page) => {
    // This will overwhelm the system
  })
);
```

## Configuration Examples

### Development

```typescript
const manager = getPuppeteerManager({
  maxContexts: 3,
  timeout: 30000,
  enableLogging: true,
  launchOptions: {
    headless: false, // See the browser
    devtools: true
  }
});
```

### Production

```typescript
const manager = getPuppeteerManager({
  maxContexts: 10,
  timeout: 60000,
  enableLogging: false,
  launchOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  }
});
```

## Performance Tips

1. **Block Unnecessary Resources**: Images, fonts, and stylesheets can slow down page loads
2. **Use Appropriate Wait Strategies**: `domcontentloaded` is faster than `networkidle2`
3. **Limit Parallel Operations**: Respect the `maxContexts` limit
4. **Close Pages**: Close unused pages within a context to free memory
5. **Reuse Contexts**: Use `withContext` for multiple pages in the same session

## Troubleshooting

### Browser won't start

- Ensure all required dependencies are installed
- Check if you have sufficient permissions
- On Linux, you may need additional packages: `apt-get install -y chromium chromium-l10n`

### Memory issues

- Reduce `maxContexts`
- Close pages after use
- Block unnecessary resources
- Use shorter timeouts

### Timeout errors

- Increase `timeout` in config
- Use faster wait strategies
- Check network connectivity
- Verify selectors exist

## License

This module is part of the assasment-cced-unila-backend project.