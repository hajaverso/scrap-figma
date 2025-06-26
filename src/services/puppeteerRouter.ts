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

    // Extrair todo o texto do body
    const text = await page.$eval('body', (el) => el.innerText);
    log.info(`Texto extraído: ${text.length} caracteres`);

    // Extrair todas as imagens
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => img.src);
    });
    log.info(`Imagens encontradas: ${images.length}`);

    // Extrair todos os vídeos e iframes
    const videos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('video, iframe')).map(el => el.src);
    });
    log.info(`Vídeos/iframes encontrados: ${videos.length}`);

    // Dados extraídos
    const extractedData = {
      url: request.url,
      title,
      text,
      images: images.filter(src => src && src.trim() !== ''), // Filtrar URLs vazias
      videos: videos.filter(src => src && src.trim() !== ''), // Filtrar URLs vazias
      extractedAt: new Date().toISOString(),
      textLength: text.length,
      imageCount: images.length,
      videoCount: videos.length
    };

    // Salvar no dataset
    await Dataset.pushData(extractedData);
    
    log.info(`Dados salvos no dataset para: ${request.url}`);
    log.info(`Resumo: ${extractedData.textLength} chars, ${extractedData.imageCount} imgs, ${extractedData.videoCount} videos`);

  } catch (error) {
    log.error(`Erro ao extrair dados de ${request.url}:`, error);
    
    // Salvar erro no dataset para debug
    await Dataset.pushData({
      url: request.url,
      error: error.message,
      extractedAt: new Date().toISOString(),
      success: false
    });
    
    throw error;
  }
});

/**
 * Handler adicional para páginas com conteúdo dinâmico
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

    // Extrair dados da mesma forma
    const title = await page.title();
    const text = await page.$eval('body', (el) => el.innerText);
    
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => img.src);
    });
    
    const videos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('video, iframe')).map(el => el.src);
    });

    // Extrair metadados adicionais para SPAs
    const metadata = await page.evaluate(() => {
      const meta = {};
      
      // Meta tags
      document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(tag => {
        const property = tag.getAttribute('property') || tag.getAttribute('name');
        const content = tag.getAttribute('content');
        if (property && content) {
          meta[property] = content;
        }
      });
      
      // Structured data
      const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      return { meta, jsonLd };
    });

    const extractedData = {
      url: request.url,
      title,
      text,
      images: images.filter(src => src && src.trim() !== ''),
      videos: videos.filter(src => src && src.trim() !== ''),
      metadata,
      extractedAt: new Date().toISOString(),
      textLength: text.length,
      imageCount: images.length,
      videoCount: videos.length,
      isSPA: true
    };

    await Dataset.pushData(extractedData);
    
    log.info(`Dados de SPA salvos para: ${request.url}`);

  } catch (error) {
    log.error(`Erro ao extrair dados de SPA ${request.url}:`, error);
    
    await Dataset.pushData({
      url: request.url,
      error: error.message,
      extractedAt: new Date().toISOString(),
      success: false,
      isSPA: true
    });
    
    throw error;
  }
});

/**
 * Handler para páginas com muito conteúdo multimídia
 * Label: 'detail-media'
 */
router.addHandler('detail-media', async ({ page, request, log }) => {
  try {
    log.info(`Extraindo dados de página com mídia: ${request.url}`);

    await page.waitForLoadState('networkidle');

    const title = await page.title();
    const text = await page.$eval('body', (el) => el.innerText);

    // Extração mais detalhada de mídia
    const mediaData = await page.evaluate(() => {
      // Imagens com mais detalhes
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        loading: img.loading
      }));

      // Vídeos com mais detalhes
      const videos = Array.from(document.querySelectorAll('video')).map(video => ({
        src: video.src,
        poster: video.poster,
        duration: video.duration,
        controls: video.controls,
        autoplay: video.autoplay
      }));

      // iframes (YouTube, Vimeo, etc.)
      const iframes = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
        src: iframe.src,
        title: iframe.title,
        width: iframe.width,
        height: iframe.height
      }));

      // Audio elements
      const audios = Array.from(document.querySelectorAll('audio')).map(audio => ({
        src: audio.src,
        controls: audio.controls,
        autoplay: audio.autoplay
      }));

      return { images, videos, iframes, audios };
    });

    const extractedData = {
      url: request.url,
      title,
      text,
      images: mediaData.images.map(img => img.src).filter(src => src && src.trim() !== ''),
      videos: [
        ...mediaData.videos.map(video => video.src),
        ...mediaData.iframes.map(iframe => iframe.src)
      ].filter(src => src && src.trim() !== ''),
      detailedMedia: mediaData,
      extractedAt: new Date().toISOString(),
      textLength: text.length,
      imageCount: mediaData.images.length,
      videoCount: mediaData.videos.length + mediaData.iframes.length,
      audioCount: mediaData.audios.length,
      isMediaRich: true
    };

    await Dataset.pushData(extractedData);
    
    log.info(`Dados de mídia salvos para: ${request.url}`);
    log.info(`Mídia: ${extractedData.imageCount} imgs, ${extractedData.videoCount} videos, ${extractedData.audioCount} audios`);

  } catch (error) {
    log.error(`Erro ao extrair dados de mídia ${request.url}:`, error);
    
    await Dataset.pushData({
      url: request.url,
      error: error.message,
      extractedAt: new Date().toISOString(),
      success: false,
      isMediaRich: true
    });
    
    throw error;
  }
});

export default router;