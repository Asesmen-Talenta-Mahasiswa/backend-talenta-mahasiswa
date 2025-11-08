# Generate PDF from Next.js App with localStorage - Complete Guide

This guide shows you how to generate a PDF from your Next.js assessment result page at `http://localhost:3001/assessment/talenta-mahasiswa/result` that requires localStorage data.

## 🎯 The Problem

Your Next.js app needs data from localStorage to render the result page properly. When Puppeteer visits the page, localStorage is empty, so the page doesn't render correctly.

## ✅ The Solution

We inject the localStorage data before the page renders, then reload the page so Next.js can access the data.

## 📋 Step-by-Step Guide

### Step 1: Understand Your Next.js App's localStorage Structure

First, you need to know what localStorage keys your Next.js app uses.

**Open your Next.js app in Chrome:**

1. Go to `http://localhost:3001/assessment/talenta-mahasiswa/result`
2. Open Chrome DevTools (F12)
3. Go to **Application** tab → **Storage** → **Local Storage** → `http://localhost:3001`
4. Note down all the keys and their values

Example localStorage structure:
```json
{
  "assessment-data": "{\"userId\":\"123\",\"results\":{...}}",
  "user-info": "{\"name\":\"John\",\"email\":\"john@example.com\"}",
  "completed-at": "2024-01-15T10:30:00.000Z"
}
```

### Step 2: Find the Right Selector to Wait For

Your page likely has a main content container that appears after data loads.

**In Chrome DevTools:**

1. Use the **Inspector** (Ctrl+Shift+C)
2. Click on the main content area
3. Note the class name or ID

Common selectors:
- `.result-container`
- `#assessment-result`
- `[data-testid="result-page"]`
- `.main-content`

### Step 3: Generate PDF Using the Service

#### Option A: Simple Usage (Recommended)

```typescript
import { PuppeteerService } from './puppeteer/service';

// Your assessment data (from database, request, etc.)
const assessmentData = {
  userId: "user-123",
  assessmentId: "assessment-456",
  answers: [
    { questionId: 1, answer: "A", score: 5 },
    { questionId: 2, answer: "B", score: 4 }
  ],
  results: {
    totalScore: 85,
    category: "High Potential",
    strengths: ["Leadership", "Communication"]
  },
  completedAt: new Date().toISOString()
};

// Generate PDF
const pdf = await PuppeteerService.generateNextJSPDF({
  url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
  localStorageData: assessmentData,
  format: 'A4',
  landscape: false,
  printBackground: true,
  waitForSelector: '.result-container', // ⚠️ CHANGE THIS to your actual selector
  waitForTimeout: 3000, // Wait 3 seconds for everything to render
  viewport: {
    width: 1920,
    height: 1080
  },
  hideHeaderFooter: true, // Automatically hide <header> and <footer> elements
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px'
  }
});

// Save to file or return as response
```

#### Option B: Advanced Usage (More Control)

```typescript
import { getPuppeteerManager } from './puppeteer';

const manager = getPuppeteerManager();

const pdf = await manager.withPage(async (page) => {
  // 1. Navigate to the page
  await page.goto('http://localhost:3001/assessment/talenta-mahasiswa/result', {
    waitUntil: 'domcontentloaded'
  });

  // 2. Inject localStorage data
  await page.evaluate((data) => {
    // Clear existing data (optional)
    localStorage.clear();
    
    // Set all your localStorage keys
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    }
  }, assessmentData);

  // 3. Reload the page so Next.js reads the localStorage
  await page.reload({ waitUntil: 'networkidle0' });

  // 4. Wait for your content to load
  await page.waitForSelector('.result-container', { timeout: 30000 });

  // 5. Optional: Wait for charts/animations
  await page.waitForFunction(() => {
    const charts = document.querySelectorAll('canvas, svg');
    return charts.length > 0;
  }, { timeout: 10000 });

  // 6. Optional: Hide header, footer, and other elements you don't want in PDF
  await page.evaluate(() => {
    document.querySelectorAll('header, footer, .no-print, button, .navigation').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });

  // 7. Generate PDF
  return await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });
});
```

### Step 4: Create an API Endpoint

#### Using the Pre-built Routes

```typescript
// In your main app file (e.g., src/index.ts)
import { Elysia } from 'elysia';
import { assessmentPDFRoutes } from './puppeteer/api-example';

const app = new Elysia()
  .use(assessmentPDFRoutes)
  .listen(3000);
```

Now you have these endpoints:

- `POST /api/pdf/generate` - Generate PDF from posted data
- `GET /api/pdf/generate/:userId/:assessmentId` - Generate from database
- `POST /api/pdf/screenshot` - Generate screenshot instead
- `GET /api/pdf/health` - Check Puppeteer status
- `POST /api/pdf/test` - Test with sample data

#### Custom Endpoint Example

```typescript
import { Elysia, t } from 'elysia';
import { PuppeteerService } from './puppeteer/service';

const app = new Elysia()
  .post('/generate-pdf', async ({ body }) => {
    // Generate PDF
    const pdf = await PuppeteerService.generateNextJSPDF({
      url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
      localStorageData: body.assessmentData,
      format: 'A4',
      printBackground: true,
      waitForSelector: '.result-container',
      waitForTimeout: 3000
    });

    // Return as downloadable file
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="result-${body.userId}.pdf"`
      }
    });
  }, {
    body: t.Object({
      userId: t.String(),
      assessmentData: t.Any()
    })
  })
  .listen(3000);
```

### Step 5: Call the API

#### From Frontend (JavaScript/TypeScript)

```typescript
// Generate and download PDF
async function downloadPDF(assessmentData: any) {
  const response = await fetch('http://localhost:3000/api/pdf/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assessmentData: assessmentData,
      options: {
        format: 'A4',
        landscape: false,
        waitTimeout: 3000
      }
    })
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `assessment-${Date.now()}.pdf`;
  a.click();
}
```

#### Using cURL (Testing)

```bash
# Test endpoint
curl -X POST http://localhost:3000/api/pdf/test --output test.pdf

# Generate with custom data
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentData": {
      "userId": "123",
      "results": {...}
    }
  }' \
  --output result.pdf

# Get by ID
curl http://localhost:3000/api/pdf/generate/user123/assessment456 --output result.pdf
```

## 🔧 Troubleshooting

### Problem: Page doesn't render correctly

**Solution:** Check your localStorage structure
```typescript
// Debug: See what's in localStorage after injection
await page.evaluate(() => {
  console.log('localStorage:', JSON.stringify(localStorage));
  return localStorage;
});
```

### Problem: Content loads slowly

**Solution:** Increase wait timeout
```typescript
waitForTimeout: 5000, // Wait 5 seconds instead of 3
```

### Problem: Charts/graphs missing in PDF

**Solution:** Wait for them to render
```typescript
await page.waitForFunction(() => {
  const charts = document.querySelectorAll('canvas, svg, .chart');
  return charts.length > 0 && 
         Array.from(charts).every(c => c.clientHeight > 0);
}, { timeout: 15000 });
```

### Problem: "Selector not found" error

**Solution:** Use a more general selector first
```typescript
// Start with body, then check for specific elements
waitForSelector: 'body', // Always exists
// Then in advanced mode:
await page.waitForSelector('.result-container', { timeout: 5000 });
```

### Problem: PDF is blank or partially rendered

**Solutions:**
1. Use `networkidle0` instead of `networkidle2`
2. Increase wait timeout
3. Add CSS for print media

```typescript
await page.addStyleTag({
  content: `
    @media print {
      * { -webkit-print-color-adjust: exact !important; }
      .no-print { display: none !important; }
    }
  `
});
```

## 📝 Complete Working Example

```typescript
// src/services/pdf-generator.ts
import { PuppeteerService } from '../puppeteer/service';
import { db } from '../db'; // Your database

export async function generateAssessmentPDF(
  userId: string,
  assessmentId: string
) {
  // 1. Get data from database
  const assessment = await db.query.assessments.findFirst({
    where: (assessments, { eq, and }) =>
      and(
        eq(assessments.userId, userId),
        eq(assessments.id, assessmentId)
      ),
    with: {
      answers: true,
      user: true
    }
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // 2. Prepare localStorage data
  const localStorageData = {
    userId: assessment.userId,
    assessmentId: assessment.id,
    userInfo: {
      name: assessment.user.name,
      email: assessment.user.email
    },
    answers: assessment.answers,
    results: assessment.results,
    completedAt: assessment.completedAt
  };

  // 3. Generate PDF
  const pdf = await PuppeteerService.generateNextJSPDF({
    url: 'http://localhost:3001/assessment/talenta-mahasiswa/result',
    localStorageData,
    format: 'A4',
    landscape: false,
    printBackground: true,
    waitForSelector: '.result-container',
    waitForTimeout: 3000,
    viewport: {
      width: 1920,
      height: 1080
    },
    hideHeaderFooter: true, // Remove <header> and <footer> elements
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm'
    }
  });

  // 4. Optional: Save to file system
  // await Bun.write(`./pdfs/assessment-${assessmentId}.pdf`, pdf);

  return pdf;
}

// Usage in API route
import { Elysia } from 'elysia';

new Elysia()
  .get('/assessment/:userId/:assessmentId/pdf', async ({ params }) => {
    const pdf = await generateAssessmentPDF(
      params.userId,
      params.assessmentId
    );

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="assessment-${params.assessmentId}.pdf"`
      }
    });
  })
  .listen(3000);
```

## 🎨 Styling Tips for PDF

Add CSS to your Next.js page for better print output:

```css
/* In your Next.js page CSS */
@media print {
  /* Ensure colors are printed */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide elements you don't want */
  .no-print,
  button,
  .navigation,
  .back-button {
    display: none !important;
  }

  /* Prevent page breaks inside elements */
  .result-card,
  .chart-container {
    page-break-inside: avoid;
  }

  /* Add page breaks where needed */
  .page-break {
    page-break-after: always;
  }

  /* Full width for print */
  .container {
    max-width: 100% !important;
    width: 100% !important;
  }
}
```

## 🚀 Performance Tips

1. **Block unnecessary resources:**
```typescript
await page.setRequestInterception(true);
page.on('request', req => {
  const type = req.resourceType();
  if (['font', 'media'].includes(type)) {
    req.abort();
  } else {
    req.continue();
  }
});
```

2. **Use connection pooling:**
```typescript
// The PuppeteerManager already does this!
// Just reuse the same manager instance
const manager = getPuppeteerManager({
  maxContexts: 10 // Allow more concurrent PDFs
});
```

3. **Generate in background:**
```typescript
// Queue PDF generation
import { Queue } from 'your-queue-library';

const pdfQueue = new Queue('pdf-generation');

pdfQueue.process(async (job) => {
  const pdf = await generateAssessmentPDF(job.data.userId, job.data.assessmentId);
  // Save or send email
});
```

## ✅ Checklist

Before deploying:

- [ ] Verified localStorage structure in Chrome DevTools
- [ ] Found the correct selector to wait for
- [ ] Tested with sample data using `/api/pdf/test`
- [ ] Checked PDF output looks correct
- [ ] Verified header and footer are hidden (hideHeaderFooter: true)
- [ ] Set appropriate viewport size (width: 1920, height: 1080)
- [ ] Added error handling
- [ ] Set appropriate timeouts
- [ ] Added print CSS styles to Next.js page
- [ ] Tested with different data scenarios
- [ ] Set up graceful shutdown for Puppeteer

## 🎉 You're Done!

You now have a fully working PDF generator for your Next.js assessment result page!

**Quick Start:**
```bash
# Test it immediately
curl -X POST http://localhost:3000/api/pdf/test --output test.pdf
```

**Need Help?**
- Check `examples.ts` for more examples
- See `api-example.ts` for API patterns
- Read `README.md` for full documentation