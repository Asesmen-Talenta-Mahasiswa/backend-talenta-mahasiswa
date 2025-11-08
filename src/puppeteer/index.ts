import puppeteer, {
  Browser,
  BrowserContext,
  Page,
  type LaunchOptions,
} from "puppeteer";

/**
 * Configuration options for the PuppeteerManager
 */
export interface PuppeteerManagerConfig {
  /** Maximum number of browser contexts to keep alive */
  maxContexts?: number;
  /** Browser launch options */
  launchOptions?: LaunchOptions;
  /** Timeout for operations in milliseconds */
  timeout?: number;
  /** Whether to enable logging */
  enableLogging?: boolean;
}

/**
 * Default configuration for the PuppeteerManager
 */
const DEFAULT_CONFIG: Required<PuppeteerManagerConfig> = {
  maxContexts: 5,
  launchOptions: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--single-process",
    ],
  },
  timeout: 30000,
  enableLogging: false,
};

/**
 * Manages a singleton browser instance with reusable, isolated contexts
 * Provides efficient, lightweight, and fresh browser contexts for each operation
 */
class PuppeteerManager {
  private static instance: PuppeteerManager | null = null;
  private browser: Browser | null = null;
  private config: Required<PuppeteerManagerConfig>;
  private activeContexts: Set<BrowserContext> = new Set();
  private isInitializing: boolean = false;
  private initializationPromise: Promise<Browser> | null = null;

  private constructor(config: PuppeteerManagerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the singleton instance of PuppeteerManager
   */
  public static getInstance(config?: PuppeteerManagerConfig): PuppeteerManager {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager(config);
    }
    return PuppeteerManager.instance;
  }

  /**
   * Initialize the browser instance
   */
  private async initializeBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = (async () => {
      try {
        this.log("Launching browser...");
        this.browser = await puppeteer.launch(this.config.launchOptions);

        this.browser.on("disconnected", () => {
          this.log("Browser disconnected");
          this.browser = null;
          this.activeContexts.clear();
        });

        this.log("Browser launched successfully");
        return this.browser;
      } finally {
        this.isInitializing = false;
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Get a fresh, isolated browser context
   * Each context has its own cookies, localStorage, and cache
   */
  public async getContext(): Promise<BrowserContext> {
    const browser = await this.initializeBrowser();

    // Clean up old contexts if we've reached the limit
    if (this.activeContexts.size >= this.config.maxContexts) {
      await this.cleanupOldestContext();
    }

    // Create a new isolated context
    const context = await browser.createBrowserContext();
    this.activeContexts.add(context);

    this.log(
      `Created new context. Active contexts: ${this.activeContexts.size}`,
    );

    return context;
  }

  /**
   * Create a new page in a fresh context
   * This is the most convenient method for one-off operations
   */
  public async getPage(): Promise<{ page: Page; context: BrowserContext }> {
    const context = await this.getContext();
    const page = await context.newPage();

    // Set default timeout
    page.setDefaultTimeout(this.config.timeout);

    this.log("Created new page");

    return { page, context };
  }

  /**
   * Execute a function with a fresh page and automatically cleanup
   * This is the recommended way to use Puppeteer for most operations
   */
  public async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
    const { page, context } = await this.getPage();

    try {
      const result = await callback(page);
      return result;
    } finally {
      await this.closeContext(context);
    }
  }

  /**
   * Execute a function with a fresh context and automatically cleanup
   * Use this when you need multiple pages in the same context
   */
  public async withContext<T>(
    callback: (context: BrowserContext) => Promise<T>,
  ): Promise<T> {
    const context = await this.getContext();

    try {
      const result = await callback(context);
      return result;
    } finally {
      await this.closeContext(context);
    }
  }

  /**
   * Close a specific context and remove it from tracking
   */
  public async closeContext(context: BrowserContext): Promise<void> {
    try {
      if (this.activeContexts.has(context)) {
        await context.close();
        this.activeContexts.delete(context);
        this.log(
          `Closed context. Active contexts: ${this.activeContexts.size}`,
        );
      }
    } catch (error) {
      this.log(`Error closing context: ${error}`);
    }
  }

  /**
   * Clean up the oldest context to free resources
   */
  private async cleanupOldestContext(): Promise<void> {
    const oldest = this.activeContexts.values().next().value;
    if (oldest) {
      await this.closeContext(oldest);
    }
  }

  /**
   * Close all active contexts
   */
  public async closeAllContexts(): Promise<void> {
    this.log("Closing all contexts...");
    const contexts = Array.from(this.activeContexts);
    await Promise.all(contexts.map((context) => this.closeContext(context)));
  }

  /**
   * Close the browser and cleanup all resources
   */
  public async close(): Promise<void> {
    this.log("Closing browser...");

    await this.closeAllContexts();

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    PuppeteerManager.instance = null;
    this.log("Browser closed");
  }

  /**
   * Check if the browser is connected
   */
  public isConnected(): boolean {
    return this.browser !== null && this.browser.connected;
  }

  /**
   * Get current statistics
   */
  public getStats(): {
    isConnected: boolean;
    activeContexts: number;
    maxContexts: number;
  } {
    return {
      isConnected: this.isConnected(),
      activeContexts: this.activeContexts.size,
      maxContexts: this.config.maxContexts,
    };
  }

  /**
   * Internal logging method
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[PuppeteerManager] ${message}`);
    }
  }
}

// Export singleton instance getter
export const getPuppeteerManager = (
  config?: PuppeteerManagerConfig,
): PuppeteerManager => {
  return PuppeteerManager.getInstance(config);
};

// Export for convenience
export default PuppeteerManager;
