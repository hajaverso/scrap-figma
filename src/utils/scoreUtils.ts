/**
 * Utilitários para validação e formatação de scores
 */

export interface ScoreValidationResult {
  isValid: boolean;
  value: number | null;
  formatted: string;
}

/**
 * Valida e formata um valor de score
 * @param value - Valor a ser validado (pode ser number, string, undefined, null)
 * @param maxValue - Valor máximo para o score (padrão: 10)
 * @param showMaxValue - Se deve mostrar "/10" no final (padrão: true)
 * @returns Objeto com informações de validação e valor formatado
 */
export function validateAndFormatScore(
  value: any, 
  maxValue: number = 10, 
  showMaxValue: boolean = true
): ScoreValidationResult {
  // Verificar se é undefined, null, ou string vazia
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      value: null,
      formatted: '–'
    };
  }

  // Verificar se é uma string inválida
  if (typeof value === 'string') {
    // Strings claramente inválidas
    if (value.trim() === '' || value === '–' || value === '-' || value === 'N/A' || value === 'n/a') {
      return {
        isValid: false,
        value: null,
        formatted: '–'
      };
    }

    // Tentar converter string com vírgula decimal para ponto
    const normalizedValue = value.replace(',', '.');
    const numericValue = parseFloat(normalizedValue);

    // Verificar se a conversão resultou em NaN
    if (isNaN(numericValue)) {
      return {
        isValid: false,
        value: null,
        formatted: '–'
      };
    }

    // Valor válido convertido de string
    const formattedValue = numericValue.toFixed(1);
    return {
      isValid: true,
      value: numericValue,
      formatted: showMaxValue ? `${formattedValue}/${maxValue}` : formattedValue
    };
  }

  // Verificar se é um número
  if (typeof value === 'number') {
    // Verificar se é NaN
    if (isNaN(value)) {
      return {
        isValid: false,
        value: null,
        formatted: '–'
      };
    }

    // Verificar se é um número finito
    if (!isFinite(value)) {
      return {
        isValid: false,
        value: null,
        formatted: '–'
      };
    }

    // Valor numérico válido
    const formattedValue = value.toFixed(1);
    return {
      isValid: true,
      value: value,
      formatted: showMaxValue ? `${formattedValue}/${maxValue}` : formattedValue
    };
  }

  // Tipo não suportado
  return {
    isValid: false,
    value: null,
    formatted: '–'
  };
}

/**
 * Formata um score de forma simples (apenas o valor com uma casa decimal ou "–")
 * @param value - Valor a ser formatado
 * @returns String formatada
 */
export function formatScore(value: any): string {
  const result = validateAndFormatScore(value, 10, false);
  return result.formatted;
}

/**
 * Formata um score com valor máximo (ex: "7.5/10" ou "–")
 * @param value - Valor a ser formatado
 * @param maxValue - Valor máximo (padrão: 10)
 * @returns String formatada
 */
export function formatScoreWithMax(value: any, maxValue: number = 10): string {
  const result = validateAndFormatScore(value, maxValue, true);
  return result.formatted;
}

/**
 * Verifica se um valor de score é válido
 * @param value - Valor a ser verificado
 * @returns true se o valor é válido, false caso contrário
 */
export function isValidScore(value: any): boolean {
  const result = validateAndFormatScore(value);
  return result.isValid;
}

/**
 * Obtém um valor numérico seguro de um score (retorna 0 se inválido)
 * @param value - Valor a ser convertido
 * @param fallback - Valor de fallback (padrão: 0)
 * @returns Número válido ou valor de fallback
 */
export function getSafeScoreValue(value: any, fallback: number = 0): number {
  const result = validateAndFormatScore(value);
  return result.isValid ? result.value! : fallback;
}

/**
 * Formata uma porcentagem de forma segura
 * @param value - Valor a ser formatado (0-1 ou 0-100)
 * @param isDecimal - Se o valor está em formato decimal (0-1) ou porcentagem (0-100)
 * @returns String formatada como porcentagem
 */
export function formatPercentage(value: any, isDecimal: boolean = true): string {
  const result = validateAndFormatScore(value, isDecimal ? 1 : 100, false);
  
  if (!result.isValid) {
    return '–';
  }

  const percentage = isDecimal ? result.value! * 100 : result.value!;
  return `${percentage.toFixed(0)}%`;
}

/**
 * Formata um valor de crescimento com sinal
 * @param value - Valor de crescimento
 * @returns String formatada com sinal e porcentagem
 */
export function formatGrowth(value: any): string {
  const result = validateAndFormatScore(value, 100, false);
  
  if (!result.isValid) {
    return '–';
  }

  const sign = result.value! >= 0 ? '+' : '';
  return `${sign}${result.value!.toFixed(1)}%`;
}

/**
 * Obtém a cor CSS baseada no valor do score
 * @param value - Valor do score
 * @param thresholds - Limites para as cores { good: number, warning: number }
 * @returns Classe CSS da cor
 */
export function getScoreColor(
  value: any, 
  thresholds: { good: number; warning: number } = { good: 7, warning: 5 }
): string {
  const result = validateAndFormatScore(value);
  
  if (!result.isValid) {
    return 'text-gray-400';
  }

  if (result.value! >= thresholds.good) {
    return 'text-green-400';
  } else if (result.value! >= thresholds.warning) {
    return 'text-yellow-400';
  } else {
    return 'text-red-400';
  }
}

/**
 * Obtém a cor CSS baseada no valor de crescimento
 * @param value - Valor de crescimento
 * @returns Classe CSS da cor
 */
export function getGrowthColor(value: any): string {
  const result = validateAndFormatScore(value);
  
  if (!result.isValid) {
    return 'text-gray-400';
  }

  if (result.value! > 0) {
    return 'text-green-400';
  } else if (result.value! < 0) {
    return 'text-red-400';
  } else {
    return 'text-gray-400';
  }
}

/**
 * Obtém a cor CSS baseada no valor de sentimento
 * @param value - Valor de sentimento (0-1)
 * @returns Classe CSS da cor
 */
export function getSentimentColor(value: any): string {
  const result = validateAndFormatScore(value, 1, false);
  
  if (!result.isValid) {
    return 'text-gray-400';
  }

  if (result.value! >= 0.7) {
    return 'text-green-400';
  } else if (result.value! >= 0.5) {
    return 'text-yellow-400';
  } else {
    return 'text-red-400';
  }
}