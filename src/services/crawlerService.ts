import { PuppeteerCrawler } from 'crawlee';
import { router } from './puppeteerRouter';

/**
 * Serviço de crawler usando Puppeteer com roteador personalizado
 */
class CrawlerService {
  private crawler: PuppeteerCrawler;

  constructor() {
    this.crawler = new PuppeteerCrawler({
      requestHandler: router,
      maxRequestsPerCrawl: 100,
      headless: true,
      launchContext: {
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      }
    });
  }

  /**
   * Inicia o crawler para extrair dados detalhados de URLs
   */
  async crawlUrls(urls: string[], label: string = 'detail') {
    const requests = urls.map(url => ({
      url,
      label
    }));

    await this.crawler.run(requests);
  }

  /**
   * Crawl específico para páginas normais
   */
  async crawlDetailPages(urls: string[]) {
    return this.crawlUrls(urls, 'detail');
  }

  /**
   * Crawl específico para SPAs (Single Page Applications)
   */
  async crawlSPAPages(urls: string[]) {
    return this.crawlUrls(urls, 'detail-spa');
  }

  /**
   * Crawl específico para páginas ricas em mídia
   */
  async crawlMediaPages(urls: string[]) {
    return this.crawlUrls(urls, 'detail-media');
  }

  /**
   * Para o crawler
   */
  async stop() {
    await this.crawler.teardown();
  }
}

export const crawlerService = new CrawlerService();