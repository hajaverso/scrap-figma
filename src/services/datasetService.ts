import { Dataset } from 'crawlee';

/**
 * Serviço para gerenciar datasets e dados extraídos
 */
class DatasetService {
  /**
   * Obtém todos os dados do dataset padrão
   */
  async getAllData() {
    const dataset = await Dataset.open();
    return dataset.getData();
  }

  /**
   * Obtém dados de um dataset específico
   */
  async getDatasetData(datasetName: string) {
    const dataset = await Dataset.open(datasetName);
    return dataset.getData();
  }

  /**
   * Filtra dados por URL
   */
  async getDataByUrl(url: string) {
    const data = await this.getAllData();
    return data.items.filter(item => item.url === url);
  }

  /**
   * Filtra dados por domínio
   */
  async getDataByDomain(domain: string) {
    const data = await this.getAllData();
    return data.items.filter(item => {
      try {
        const itemDomain = new URL(item.url).hostname;
        return itemDomain.includes(domain);
      } catch {
        return false;
      }
    });
  }

  /**
   * Obtém estatísticas dos dados extraídos
   */
  async getExtractionStats() {
    const data = await this.getAllData();
    const items = data.items;

    const stats = {
      totalPages: items.length,
      successfulExtractions: items.filter(item => item.success !== false).length,
      failedExtractions: items.filter(item => item.success === false).length,
      totalImages: items.reduce((sum, item) => sum + (item.imageCount || 0), 0),
      totalVideos: items.reduce((sum, item) => sum + (item.videoCount || 0), 0),
      totalTextLength: items.reduce((sum, item) => sum + (item.textLength || 0), 0),
      avgTextLength: 0,
      domains: new Set(items.map(item => {
        try {
          return new URL(item.url).hostname;
        } catch {
          return 'unknown';
        }
      })).size,
      extractionDates: {
        earliest: null,
        latest: null
      }
    };

    stats.avgTextLength = stats.totalPages > 0 ? stats.totalTextLength / stats.totalPages : 0;

    const dates = items
      .map(item => item.extractedAt)
      .filter(Boolean)
      .map(date => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      stats.extractionDates.earliest = dates[0];
      stats.extractionDates.latest = dates[dates.length - 1];
    }

    return stats;
  }

  /**
   * Exporta dados para JSON
   */
  async exportToJson(filename?: string) {
    const data = await this.getAllData();
    const jsonData = JSON.stringify(data.items, null, 2);
    
    if (typeof window !== 'undefined') {
      // Browser environment
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `extracted-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    return jsonData;
  }

  /**
   * Limpa todos os dados do dataset
   */
  async clearDataset() {
    const dataset = await Dataset.open();
    await dataset.drop();
  }
}

export const datasetService = new DatasetService();