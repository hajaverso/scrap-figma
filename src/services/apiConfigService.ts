interface APIConfig {
  apifyKey?: string;
  serpApiKey?: string;
  openaiKey?: string;
  simpleScraperKey?: string;
}

interface APITestResult {
  isValid: boolean;
  message: string;
  status: 'success' | 'error' | 'warning';
}

class APIConfigService {
  private readonly STORAGE_KEY = 'haja_yodea_api_config';
  private config: APIConfig = {};

  constructor() {
    this.loadConfig();
  }

  // Carregar configurações do localStorage
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.config = {};
    }
  }

  // Salvar configurações no localStorage
  saveConfig(config: APIConfig): void {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw new Error('Erro ao salvar configurações');
    }
  }

  // Obter configuração específica
  getConfig(key: keyof APIConfig): string | undefined {
    return this.config[key];
  }

  // Obter todas as configurações
  getAllConfig(): APIConfig {
    return { ...this.config };
  }

  // Verificar se uma API está configurada
  isConfigured(key: keyof APIConfig): boolean {
    return !!this.config[key];
  }

  // Limpar configuração específica
  clearConfig(key: keyof APIConfig): void {
    delete this.config[key];
    this.saveConfig({});
  }

  // Limpar todas as configurações
  clearAllConfig(): void {
    this.config = {};
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Testar Apify API
  async testApifyAPI(apiKey: string): Promise<APITestResult> {
    try {
      const response = await fetch('https://api.apify.com/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: true,
          message: `Conectado como: ${data.username || 'Usuário'}`,
          status: 'success'
        };
      } else if (response.status === 401) {
        return {
          isValid: false,
          message: 'API Key inválida ou expirada',
          status: 'error'
        };
      } else {
        return {
          isValid: false,
          message: `Erro HTTP: ${response.status}`,
          status: 'error'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: 'Erro de conexão com Apify',
        status: 'error'
      };
    }
  }

  // Testar SerpAPI
  async testSerpAPI(apiKey: string): Promise<APITestResult> {
    try {
      const response = await fetch(`https://serpapi.com/account.json?api_key=${apiKey}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          isValid: true,
          message: `Conta ativa - ${data.searches_left || 0} buscas restantes`,
          status: 'success'
        };
      } else if (response.status === 401) {
        return {
          isValid: false,
          message: 'API Key inválida',
          status: 'error'
        };
      } else {
        return {
          isValid: false,
          message: `Erro HTTP: ${response.status}`,
          status: 'error'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: 'Erro de conexão com SerpAPI',
        status: 'error'
      };
    }
  }

  // Testar OpenAI API
  async testOpenAIAPI(apiKey: string): Promise<APITestResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const modelCount = data.data?.length || 0;
        return {
          isValid: true,
          message: `Conectado - ${modelCount} modelos disponíveis`,
          status: 'success'
        };
      } else if (response.status === 401) {
        return {
          isValid: false,
          message: 'API Key inválida ou sem permissões',
          status: 'error'
        };
      } else if (response.status === 429) {
        return {
          isValid: false,
          message: 'Limite de rate excedido',
          status: 'warning'
        };
      } else {
        return {
          isValid: false,
          message: `Erro HTTP: ${response.status}`,
          status: 'error'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: 'Erro de conexão com OpenAI',
        status: 'error'
      };
    }
  }

  // Testar SimpleScraper API
  async testSimpleScraperAPI(apiKey: string): Promise<APITestResult> {
    try {
      // SimpleScraper geralmente usa autenticação via header
      const response = await fetch('https://api.simplescraper.io/v1/account', {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: true,
          message: `Conta ativa - Plano: ${data.plan || 'Básico'}`,
          status: 'success'
        };
      } else if (response.status === 401) {
        return {
          isValid: false,
          message: 'API Key inválida',
          status: 'error'
        };
      } else {
        return {
          isValid: false,
          message: `Erro HTTP: ${response.status}`,
          status: 'error'
        };
      }
    } catch (error) {
      // Como SimpleScraper é opcional, retornar sucesso com aviso
      return {
        isValid: true,
        message: 'API opcional - Configuração salva',
        status: 'warning'
      };
    }
  }

  // Método principal para testar qualquer API
  async testAPI(type: keyof APIConfig, apiKey: string): Promise<APITestResult> {
    switch (type) {
      case 'apifyKey':
        return this.testApifyAPI(apiKey);
      case 'serpApiKey':
        return this.testSerpAPI(apiKey);
      case 'openaiKey':
        return this.testOpenAIAPI(apiKey);
      case 'simpleScraperKey':
        return this.testSimpleScraperAPI(apiKey);
      default:
        return {
          isValid: false,
          message: 'Tipo de API não reconhecido',
          status: 'error'
        };
    }
  }

  // Verificar status geral das APIs
  getAPIStatus(): { [key: string]: boolean } {
    return {
      apify: this.isConfigured('apifyKey'),
      serpApi: this.isConfigured('serpApiKey'),
      openai: this.isConfigured('openaiKey'),
      simpleScraper: this.isConfigured('simpleScraperKey')
    };
  }

  // Obter mensagem de aviso para módulos
  getWarningMessage(requiredAPIs: (keyof APIConfig)[]): string | null {
    const missing = requiredAPIs.filter(api => !this.isConfigured(api));
    
    if (missing.length === 0) return null;
    
    const apiNames = {
      apifyKey: 'Apify',
      serpApiKey: 'SerpAPI',
      openaiKey: 'OpenAI',
      simpleScraperKey: 'SimpleScraper'
    };
    
    const missingNames = missing.map(api => apiNames[api]).join(', ');
    return `Configure suas APIs nas Configurações para ativar esta função: ${missingNames}`;
  }
}

export const apiConfigService = new APIConfigService();