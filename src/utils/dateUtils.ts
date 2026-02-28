// utils/dateUtils.ts

/**
 * Formata uma data de forma segura, lidando com diferentes tipos de entrada
 */
export const formatDate = (date: Date | string | any, locale: string = 'pt-BR'): string => {
  try {
    if (!date) return 'Data inválida';
    
    // Se já é uma instância de Date
    if (date instanceof Date) {
      return date.toLocaleDateString(locale);
    }
    
    // Se é um timestamp do Firestore
    if (date && typeof date === 'object' && date.toDate) {
      return date.toDate().toLocaleDateString(locale);
    }
    
    // Se é uma string ou número, tentar converter
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    console.error('Erro ao formatar data:', error, date);
    return 'Data inválida';
  }
};

/**
 * Formata data e hora de forma segura
 */
export const formatDateTime = (date: Date | string | any, locale: string = 'pt-BR'): string => {
  try {
    if (!date) return 'Data inválida';
    
    if (date instanceof Date) {
      return date.toLocaleString(locale);
    }
    
    if (date && typeof date === 'object' && date.toDate) {
      return date.toDate().toLocaleString(locale);
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return dateObj.toLocaleString(locale);
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error, date);
    return 'Data inválida';
  }
};

/**
 * Verifica se uma data é válida
 */
export const isValidDate = (date: any): boolean => {
  try {
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    
    if (date && typeof date === 'object' && date.toDate) {
      return !isNaN(date.toDate().getTime());
    }
    
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
};