import { createPuppeteerRouter, Dataset } from 'crawlee';

/**
 * Roteador Puppeteer para extração detalhada de conteúdo de páginas
 */
export const router = createPuppeteerRouter();

/**
 * Handler para extrair dados detalhados de uma página
 * Label: 'detail'
 */
router.addHandler('detail', async ({ page, request, log }) => {
  try {
    log.info(`Extraindo dados detalhados de: ${request.url}`);

    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');

    // Extrair título da página
    const title = await page.title();
    log.info(`Título extraído: ${title}`);

    // Extrair description, image e HTML usando page.evaluate
    const pageData = await page.evaluate(() => {
      // Extrair description de meta tags
      let description = '';
      
      // Tentar Open Graph description primeiro
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        description = ogDescription.getAttribute('content') || '';
      }
      
      // Se não encontrou, tentar meta description padrão
      if (!description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          description = metaDescription.getAttribute('content') || '';
        }
      }
      
      // Se ainda não encontrou, tentar extrair do primeiro parágrafo
      if (!description) {
        const firstParagraph = document.querySelector('p');
        if (firstParagraph) {
          description = firstParagraph.textContent?.substring(0, 160) || '';
        }
      }

      // Extrair image de meta tags
      let image = '';
      
      // Tentar Open Graph image primeiro
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        image = ogImage.getAttribute('content') || '';
      }
      
      // Se não encontrou, tentar Twitter card image
      if (!image) {
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) {
          image = twitterImage.getAttribute('content') || '';
        }
      }
      
      // Se não encontrou, tentar primeira imagem da página
      if (!image) {
        const firstImg = document.querySelector('img[src]');
        if (firstImg) {
          image = firstImg.getAttribute('src') || '';
        }
      }

      // Extrair HTML completo
      const html = document.documentElement.outerHTML;

      // Extrair texto do body
      const text = document.body.innerText || '';

      // Extrair metadados adicionais
      const metadata = {
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        author: document.querySelector('meta[name="author"]')?.getAttribute('content') || '',
        publishedTime: document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '',
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
        language: document.documentElement.lang || '',
        charset: document.characterSet || '',
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || ''
      };

      return {
        description,
        image,
        html,
        text,
        metadata,
        textLength: text.length,
        htmlLength: html.length
      };
    });

    // Extrair todas as imagens da página
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0
      }));
    });

    // Extrair todos os vídeos e iframes
    const videos = await page.evaluate(() => {
      const videoElements = Array.from(document.querySelectorAll('video')).map(video => ({
        src: video.src,
        poster: video.poster || '',
        duration: video.duration || 0,
        type: 'video'
      }));

      const iframeElements = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
        src: iframe.src,
        title: iframe.title || '',
        width: iframe.width || '',
        height: iframe.height || '',
        type: 'iframe'
      }));

      return [...videoElements, ...iframeElements];
    });

    // Dados extraídos completos
    const extractedData = {
      url: request.url,
      title,
      description: pageData.description,
      image: pageData.image,
      html: pageData.html,
      text: pageData.text,
      images: images.filter(img => img.src && img.src.trim() !== ''),
      videos: videos.filter(video => video.src && video.src.trim() !== ''),
      metadata: pageData.metadata,
      extractedAt: new Date().toISOString(),
      textLength: pageData.textLength,
      htmlLength: pageData.htmlLength,
      imageCount: images.length,
      videoCount: videos.length,
      success: true
    };

    // Salvar no dataset como array
    await Dataset.pushData([extractedData]);
    
    log.info(`Dados salvos no dataset para: ${request.url}`);
    log.info(`Resumo: ${extractedData.textLength} chars, ${extractedData.imageCount} imgs, ${extractedData.videoCount} videos`);
    log.info(`Description: ${extractedData.description.substring(0, 100)}...`);
    log.info(`Image: ${extractedData.image}`);

  } catch (error) {
    log.error(`Erro ao extrair dados de ${request.url}:`, error);
    
    // Salvar erro no dataset
    await Dataset.pushData([{
      url: request.url,
      title: '',
      description: '',
      image: '',
      html: '',
      text: '',
      images: [],
      videos: [],
      error: error.message,
      extractedAt: new Date().toISOString(),
      success: false
    }]);
    
    throw error;
  }
});

/**
 * Handler para páginas com conteúdo dinâmico (SPAs)
 * Label: 'detail-spa'
 */
router.addHandler('detail-spa', async ({ page, request, log }) => {
  try {
    log.info(`Extraindo dados de SPA: ${request.url}`);

    // Aguardar mais tempo para SPAs carregarem
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Tentar aguardar elementos específicos carregarem
    try {
      await page.waitForSelector('main, article, .content, #content', { timeout: 5000 });
    } catch {
      log.warning('Elementos de conteúdo não encontrados, continuando...');
    }

    const title = await page.title();

    const pageData = await page.evaluate(() => {
      // Mesma lógica de extração, mas com mais tolerância para SPAs
      let description = '';
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        description = ogDescription.getAttribute('content') || '';
      }
      
      if (!description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          description = metaDescription.getAttribute('content') || '';
        }
      }
      
      if (!description) {
        // Para SPAs, tentar selectors mais específicos
        const contentSelectors = ['main p', 'article p', '.content p', '#content p', 'p'];
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            description = element.textContent.substring(0, 160);
            break;
          }
        }
      }

      let image = '';
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        image = ogImage.getAttribute('content') || '';
      }
      
      if (!image) {
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) {
          image = twitterImage.getAttribute('content') || '';
        }
      }
      
      if (!image) {
        // Para SPAs, procurar imagens em containers específicos
        const imageSelectors = ['main img', 'article img', '.content img', '#content img', 'img'];
        for (const selector of imageSelectors) {
          const imgElement = document.querySelector(selector);
          if (imgElement && imgElement.getAttribute('src')) {
            image = imgElement.getAttribute('src') || '';
            break;
          }
        }
      }

      const html = document.documentElement.outerHTML;
      const text = document.body.innerText || '';

      return { description, image, html, text };
    });

    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0
      }));
    });

    const videos = await page.evaluate(() => {
      const videoElements = Array.from(document.querySelectorAll('video')).map(video => ({
        src: video.src,
        poster: video.poster || '',
        duration: video.duration || 0,
        type: 'video'
      }));

      const iframeElements = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
        src: iframe.src,
        title: iframe.title || '',
        width: iframe.width || '',
        height: iframe.height || '',
        type: 'iframe'
      }));

      return [...videoElements, ...iframeElements];
    });

    const extractedData = {
      url: request.url,
      title,
      description: pageData.description,
      image: pageData.image,
      html: pageData.html,
      text: pageData.text,
      images: images.filter(img => img.src && img.src.trim() !== ''),
      videos: videos.filter(video => video.src && video.src.trim() !== ''),
      extractedAt: new Date().toISOString(),
      textLength: pageData.text.length,
      htmlLength: pageData.html.length,
      imageCount: images.length,
      videoCount: videos.length,
      isSPA: true,
      success: true
    };

    await Dataset.pushData([extractedData]);
    
    log.info(`Dados de SPA salvos para: ${request.url}`);

  } catch (error) {
    log.error(`Erro ao extrair dados de SPA ${request.url}:`, error);
    
    await Dataset.pushData([{
      url: request.url,
      title: '',
      description: '',
      image: '',
      html: '',
      text: '',
      images: [],
      videos: [],
      error: error.message,
      extractedAt: new Date().toISOString(),
      success: false,
      isSPA: true
    }]);
    
    throw error;
  }
});

export default router;