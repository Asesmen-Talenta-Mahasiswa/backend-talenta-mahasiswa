# Next.js PDF Generation - Quick Reference Cheat Sheet

## 🚀 Quick Start (Copy & Paste Ready)

### 1. Simple PDF Generation

```typescript
import { PuppeteerService } from './puppeteer/service';

const pdf = await PuppeteerService.generateNextJSPDF({
  url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
  localStorageData: {
    userId: '123',
    assessmentId: '456',
    // ... your data
  },
  format: 'A4',
  printBackground: true,
  waitForSelector: 'body', // Change to your selector
  waitForTimeout: 3000,
  viewport: { width: 1920, height: 1080 }, // Custom viewport size
  hideHeaderFooter: true // Automatically hide <header> and <footer>
});
```

### 2. Elysia API Endpoint

```typescript
import { Elysia } from 'elysia';
import { PuppeteerService } from './puppeteer/service';

new Elysia()
  .post('/generate-pdf', async ({ body }) => {
    const pdf = await PuppeteerService.generateNextJSPDF({
      url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
      localStorageData: body.data,
      format: 'A4',
      printBackground: true,
      waitForSelector: '.result-container',
      waitForTimeout: 3000
    });

    return new Response(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="result.pdf"'
      }
    });
  })
  .listen(3000);
```

### 3. With Database Data

```typescript
async function generatePDFFromDB(userId: string, assessmentId: string) {
  // Fetch from database
  const data = await db.query.assessments.findFirst({
    where: (a, { eq }) => eq(a.id, assessmentId)
  });

  // Generate PDF
  const pdf = await PuppeteerService.generateNextJSPDF({
    url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
    localStorageData: data,
    format: 'A4',
    printBackground: true,
    waitForSelector: '.result-container',
    waitForTimeout: 3000,
    viewport: { width: 1920, height: 1080 },
    hideHeaderFooter: true
  });

  return pdf;
}
```

## 📋 Common Patterns

### Find Your localStorage Structure
```javascript
// In Chrome DevTools Console (on your Next.js page):
console.log(JSON.stringify(localStorage));
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});
```

### Find the Right Selector
```javascript
// Test in Chrome DevTools Console:
document.querySelector('.result-container'); // Should not be null
document.querySelector('#assessment-result'); // Try different selectors
```

### Wait for Charts/Graphs
```typescript
await page.waitForFunction(() => {
  const charts = document.querySelectorAll('canvas, svg');
  return charts.length > 0;
}, { timeout: 10000 });
```

### Hide Elements in PDF (Automatic)
```typescript
// Header and footer are hidden automatically when hideHeaderFooter: true
// For additional elements:
await page.evaluate(() => {
  document.querySelectorAll('.no-print, button, nav').forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });
});
```

## 🎯 localStorage Data Formats

### Format 1: Single JSON Object
```typescript
localStorageData: {
  'assessment-data': JSON.stringify({
    userId: '123',
    results: {...}
  })
}
```

### Format 2: Separate Keys
```typescript
localStorageData: {
  userId: '123',
  assessmentId: '456',
  answers: JSON.stringify([...]),
  results: JSON.stringify({...})
}
```

### Format 3: Mixed
```typescript
localStorageData: {
  'user-info': JSON.stringify({ name: 'John' }),
  'assessment-id': '456',
  'results': {...} // Auto-stringified
}
```

## ⚙️ Configuration Options

```typescript
{
  url: string,                    // Required: Your Next.js page URL
  localStorageData: object,       // Required: Data to inject
  format?: 'A4' | 'Letter' | 'Legal',  // Default: 'A4'
  landscape?: boolean,            // Default: false
  printBackground?: boolean,      // Default: true
  waitForSelector?: string,       // Selector to wait for
  waitForTimeout?: number,        // Additional wait time (ms)
  viewport?: {                    // Custom viewport size
    width: number,                // Default: browser default
    height: number
  },
  hideHeaderFooter?: boolean,     // Hide <header> & <footer> (Default: true)
  margin?: {
    top?: string,    // e.g., '20px', '10mm'
    right?: string,
    bottom?: string,
    left?: string
  }
}
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| PDF is blank | Increase `waitForTimeout` to 5000+ |
| Charts missing | Add `waitForFunction` for canvas/svg |
| Selector not found | Use `'body'` or check selector in DevTools |
| Slow generation | Use `waitUntil: 'domcontentloaded'` |
| Colors missing | Set `printBackground: true` |
| Page cut off | Adjust `margin` values |

## 📞 API Endpoints (Pre-built)

```typescript
import { assessmentPDFRoutes } from './puppeteer/api-example';
app.use(assessmentPDFRoutes);
```

Gives you:
- `POST /api/pdf/generate` - Generate from posted data
- `GET /api/pdf/generate/:userId/:assessmentId` - From DB
- `POST /api/pdf/screenshot` - Screenshot instead
- `GET /api/pdf/health` - Check status
- `POST /api/pdf/test` - Test with sample data

## 🧪 Testing

### Test from Command Line
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/pdf/test --output test.pdf

# Generate custom
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"assessmentData": {"userId": "123"}}' \
  --output result.pdf
```

### Test from JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/pdf/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assessmentData: { userId: '123', results: {...} }
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url); // Open PDF in new tab
```

## 💾 Save to File

```typescript
// Using Bun
await Bun.write('./output.pdf', pdf);

// Using Node.js
import { writeFileSync } from 'fs';
writeFileSync('./output.pdf', pdf);
```

## 🎨 Print CSS (Add to Next.js Page)

```css
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .no-print, button, nav { display: none !important; }
  
  .page-break { page-break-after: always; }
  
  .no-break { page-break-inside: avoid; }
}
```

## ⚡ Performance Tips

```typescript
// Block unnecessary resources
await page.setRequestInterception(true);
page.on('request', req => {
  if (['image', 'font', 'media'].includes(req.resourceType())) {
    req.abort();
  } else {
    req.continue();
  }
});

// Use faster wait strategy
waitUntil: 'domcontentloaded' // Instead of 'networkidle0'

// Increase max contexts for concurrent PDFs
getPuppeteerManager({ maxContexts: 10 });

// Custom viewport for consistent rendering
viewport: { width: 1920, height: 1080 }
```

## 🔐 Production Checklist

- [ ] Set correct `waitForSelector` for your page
- [ ] Test with real data from database
- [ ] Add error handling and retries
- [ ] Set appropriate timeouts (not too short!)
- [ ] Add print CSS to Next.js page
- [ ] Test PDF output on different browsers
- [ ] Set up graceful shutdown
- [ ] Monitor Puppeteer memory usage
- [ ] Consider PDF generation queue for scale
- [ ] Add logging for debugging

## 📚 File Reference

- `service.ts` - Main service methods
- `api-example.ts` - Ready-to-use API endpoints
- `nextjs-example.ts` - Usage examples
- `NEXTJS-GUIDE.md` - Complete step-by-step guide
- `README.md` - Full documentation

## 🆘 Emergency Debug

```typescript
// See rendered HTML
const { pdf, html } = await generatePDFWithDebug(data);
console.log(html); // Inspect what was rendered

// Check localStorage was injected
const storage = await page.evaluate(() => {
  return JSON.stringify(localStorage);
});
console.log('localStorage:', storage);

// Take screenshot before PDF
await page.screenshot({ path: 'debug.png' });
const pdf = await page.pdf({ path: 'output.pdf' });
```

## 📞 Common Selectors to Try

```javascript
'body'                          // Always exists
'.result-container'             // Main container
'#assessment-result'            // Result ID
'[data-testid="result"]'       // Test ID
'.main-content'                 // Content area
'h1'                            // Page heading
'.card:first-child'            // First card
```

## 🎯 Copy-Paste Examples

### Minimal Example
```typescript
const pdf = await PuppeteerService.generateNextJSPDF({
  url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
  localStorageData: yourData,
  waitForTimeout: 3000,
  hideHeaderFooter: true // Removes <header> and <footer>
});
```

### Production Example
```typescript
const pdf = await PuppeteerService.generateNextJSPDF({
  url: process.env.NEXTJS_URL + '/assessment/talenta-mahasiswa/result',
  localStorageData: assessmentData,
  format: 'A4',
  landscape: false,
  printBackground: true,
  waitForSelector: '.result-loaded',
  waitForTimeout: 5000,
  viewport: { width: 1920, height: 1080 }, // Custom viewport
  hideHeaderFooter: true, // Remove header and footer
  margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
});
```

---

**Need more help?** Check `NEXTJS-GUIDE.md` for detailed explanations!