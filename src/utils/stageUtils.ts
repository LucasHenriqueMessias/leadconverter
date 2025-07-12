import { DEFAULT_STAGES } from '@/constants/salesFunnel';

export const normalizeStage = (stage: string): string => {
  // Se o stage já é válido, retorna
  if (DEFAULT_STAGES.some(s => s.id === stage)) {
    return stage;
  }
  
  // Se é um ID do Firebase, converte para 'lead' por padrão
  if (stage.length > 10 && stage.match(/^[a-zA-Z0-9]+$/)) {
    console.warn(`Converting invalid stage ID "${stage}" to "lead"`);
    return 'lead';
  }
  
  // Para outros casos, retorna 'lead' como padrão
  console.warn(`Unknown stage "${stage}", defaulting to "lead"`);
  return 'lead';
};

export const isValidStage = (stage: string): boolean => {
  return DEFAULT_STAGES.some(s => s.id === stage);
};

export const getStageInfo = (stageId: string) => {
  return DEFAULT_STAGES.find(s => s.id === stageId);
};
