interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  keyword: string;
  period: string;
  metadata?: {
    analysisDepth?: string;
    sourcePriority?: string;
    includeVideos?: boolean;
  };
}

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  oldestEntry?: Date;
  newestEntry?: Date;
  cacheSize: string;
}

interface CacheConfig {
  defaultTTL: number; // Time to live em milissegundos
  maxEntries: number; // Máximo de entradas no cache
  cleanupInterval: number; // Intervalo de limpeza automática
  enableCompression: boolean; // Compressão dos dados
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0
  };
  
  private config: CacheConfig = {
    defaultTTL: 12 * 60 * 60 * 1000, // 12 horas
    maxEntries: 1000,
    cleanupInterval: 30 * 60 * 1000, // 30 minutos
    enableCompression: true
  };

  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.startCleanupTimer();
    this.loadFromStorage();
  }

  /**
   * Gera uma chave única para o cache baseada na keyword e parâmetros
   */
  private generateCacheKey(
    keyword: string, 
    period: string, 
    metadata?: any
  ): string {
    const baseKey = `${keyword.toLowerCase().trim()}_${period}`;
    
    if (metadata) {
      const metaString = Object.entries(metadata)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');
      
      return `${baseKey}_${this.hashString(metaString)}`;
    }
    
    return baseKey;
  }

  /**
   * Hash simples para metadados
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Verifica se uma entrada está expirada
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Comprime dados se a compressão estiver habilitada
   */
  private compressData(data: any): any {
    if (!this.config.enableCompression) return data;
    
    try {
      // Simular compressão removendo campos desnecessários
      if (Array.isArray(data)) {
        return data.map(item => {
          if (typeof item === 'object' && item !== null) {
            // Manter apenas campos essenciais
            const compressed = { ...item };
            delete compressed.fullContent; // Remover conteúdo completo para economizar espaço
            return compressed;
          }
          return item;
        });
      }
      return data;
    } catch (error) {
      console.warn('Erro na compressão dos dados:', error);
      return data;
    }
  }

  /**
   * Descomprime dados
   */
  private decompressData(data: any): any {
    // Para este exemplo, apenas retorna os dados
    // Em uma implementação real, você faria a descompressão aqui
    return data;
  }

  /**
   * Armazena dados no cache
   */
  set<T>(
    keyword: string,
    period: string,
    data: T,
    ttl?: number,
    metadata?: any
  ): void {
    const cacheKey = this.generateCacheKey(keyword, period, metadata);
    const now = Date.now();
    const expirationTime = ttl || this.config.defaultTTL;
    
    // Verificar limite de entradas
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldestEntries();
    }

    const entry: CacheEntry<T> = {
      data: this.config.enableCompression ? this.compressData(data) : data,
      timestamp: now,
      expiresAt: now + expirationTime,
      keyword: keyword.toLowerCase().trim(),
      period,
      metadata
    };

    this.cache.set(cacheKey, entry);
    
    console.log(`📦 Cache SET: "${keyword}" (${period}) - Expira em ${this.formatDuration(expirationTime)}`);
    
    // Salvar no localStorage
    this.saveToStorage();
  }

  /**
   * Recupera dados do cache
   */
  get<T>(
    keyword: string,
    period: string,
    metadata?: any
  ): T | null {
    const cacheKey = this.generateCacheKey(keyword, period, metadata);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      console.log(`📦 Cache MISS: "${keyword}" (${period})`);
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      this.stats.misses++;
      console.log(`📦 Cache EXPIRED: "${keyword}" (${period}) - Removido`);
      this.saveToStorage();
      return null;
    }

    this.stats.hits++;
    console.log(`📦 Cache HIT: "${keyword}" (${period}) - Válido por mais ${this.formatDuration(entry.expiresAt - Date.now())}`);
    
    return this.decompressData(entry.data) as T;
  }

  /**
   * Verifica se existe uma entrada válida no cache
   */
  has(keyword: string, period: string, metadata?: any): boolean {
    const cacheKey = this.generateCacheKey(keyword, period, metadata);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      this.saveToStorage();
      return false;
    }
    
    return true;
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(keyword: string, period: string, metadata?: any): boolean {
    const cacheKey = this.generateCacheKey(keyword, period, metadata);
    const deleted = this.cache.delete(cacheKey);
    
    if (deleted) {
      console.log(`📦 Cache DELETE: "${keyword}" (${period})`);
      this.saveToStorage();
    }
    
    return deleted;
  }

  /**
   * Limpa entradas expiradas
   */
  cleanup(): number {
    const initialSize = this.cache.size;
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`📦 Cache CLEANUP: ${removedCount} entradas expiradas removidas`);
      this.saveToStorage();
    }

    return removedCount;
  }

  /**
   * Remove as entradas mais antigas quando o limite é atingido
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Ordenar por timestamp (mais antigo primeiro)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remover 10% das entradas mais antigas
    const toRemove = Math.ceil(entries.length * 0.1);
    
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }
    
    console.log(`📦 Cache EVICTION: ${toRemove} entradas antigas removidas`);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    
    console.log(`📦 Cache CLEAR: ${size} entradas removidas`);
    
    // Limpar localStorage
    localStorage.removeItem('haja_yodea_cache');
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    const expiredCount = entries.filter(entry => this.isExpired(entry)).length;
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    const timestamps = entries.map(entry => entry.timestamp);
    const oldestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newestTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;
    
    // Calcular tamanho aproximado do cache
    const cacheSize = this.calculateCacheSize();

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      oldestEntry: oldestTimestamp ? new Date(oldestTimestamp) : undefined,
      newestEntry: newestTimestamp ? new Date(newestTimestamp) : undefined,
      cacheSize
    };
  }

  /**
   * Calcula o tamanho aproximado do cache
   */
  private calculateCacheSize(): string {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      const sizeInBytes = new Blob([serialized]).size;
      
      if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
      } else if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Obtém todas as entradas por keyword
   */
  getEntriesByKeyword(keyword: string): Array<{ period: string; data: any; expiresAt: Date }> {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const entries: Array<{ period: string; data: any; expiresAt: Date }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.keyword === normalizedKeyword && !this.isExpired(entry)) {
        entries.push({
          period: entry.period,
          data: this.decompressData(entry.data),
          expiresAt: new Date(entry.expiresAt)
        });
      }
    }

    return entries.sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime());
  }

  /**
   * Atualiza configurações do cache
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reiniciar timer de limpeza se o intervalo mudou
    if (newConfig.cleanupInterval) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
    
    console.log('📦 Cache CONFIG: Configurações atualizadas', this.config);
  }

  /**
   * Inicia o timer de limpeza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Para o timer de limpeza automática
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Salva o cache no localStorage
   */
  private saveToStorage(): void {
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now()
      };
      
      localStorage.setItem('haja_yodea_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  /**
   * Carrega o cache do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('haja_yodea_cache');
      if (!stored) return;

      const cacheData = JSON.parse(stored);
      const now = Date.now();
      
      // Carregar entradas não expiradas
      let loadedCount = 0;
      for (const [key, entry] of cacheData.entries) {
        if (entry.expiresAt > now) {
          this.cache.set(key, entry);
          loadedCount++;
        }
      }
      
      // Restaurar estatísticas
      if (cacheData.stats) {
        this.stats = cacheData.stats;
      }
      
      console.log(`📦 Cache LOADED: ${loadedCount} entradas válidas carregadas do localStorage`);
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }
  }

  /**
   * Formata duração em formato legível
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Exporta o cache para análise
   */
  exportCache(): any {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      keyword: entry.keyword,
      period: entry.period,
      timestamp: new Date(entry.timestamp).toISOString(),
      expiresAt: new Date(entry.expiresAt).toISOString(),
      isExpired: this.isExpired(entry),
      metadata: entry.metadata,
      dataSize: JSON.stringify(entry.data).length
    }));

    return {
      stats: this.getStats(),
      config: this.config,
      entries,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Destructor - limpa recursos
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.saveToStorage();
  }
}

// Instância singleton do cache
export const cacheService = new CacheService();

// Limpar recursos quando a página é fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheService.destroy();
  });
}