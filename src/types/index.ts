// types/index.ts

// Organização (multi-tenancy)
export interface Organization {
  id: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  maxDeals: number;
  ownerId: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  customFields: CustomField[];
  salesStages: SalesFunnelStage[];
  integrations: Integration[];
  automations: Automation[];
  funnels: SalesFunnel[];
  slaRules: SLARule[];
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  entity: 'client' | 'deal' | 'task' | 'quote';
}

export interface Integration {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'telephony' | 'zapier';
  enabled: boolean;
  config: Record<string, any>;
}

// Sistema de permissões
export interface Permission {
  resource: 'deals' | 'clients' | 'reports' | 'settings' | 'users' | 'organization';
  actions: ('create' | 'read' | 'update' | 'delete')[];
  scope: 'own' | 'team' | 'organization';
}

export type UserRole = 'admin' | 'manager' | 'sales' | 'viewer';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  approved: boolean;
  teamId?: string;
  managerId?: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  segment: string;
  notes: string;
  customFields: Record<string, any>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Histórico de Relacionamento
export interface Interaction {
  id: string;
  organizationId: string;
  clientId: string;
  dealId?: string;
  userId: string;
  userName: string; // Nome do usuário que criou (para exibição)
  type: 'call' | 'meeting' | 'whatsapp' | 'email' | 'note';
  subject: string; // Assunto/título da interação
  description: string;
  date: Date; // Data/hora da interação
  duration?: number; // Duração em minutos (para ligações e reuniões)
  outcome?: 'positive' | 'neutral' | 'negative'; // Resultado da interação
  nextAction?: string; // Próxima ação sugerida
  attachments?: InteractionAttachment[];
  metadata?: Record<string, any>; // Dados específicos por tipo
  createdAt: Date;
  updatedAt: Date;
}

export interface InteractionAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // mime type
  size: number;
}

// Tipos específicos de interação para melhor tipagem
export interface CallInteraction extends Interaction {
  type: 'call';
  duration: number;
  phoneNumber: string;
  callStatus: 'completed' | 'missed' | 'voicemail';
}

export interface MeetingInteraction extends Interaction {
  type: 'meeting';
  duration: number;
  location?: string;
  attendees?: string[];
  meetingType: 'presencial' | 'online' | 'phone';
}

export interface EmailInteraction extends Interaction {
  type: 'email';
  emailSubject: string;
  emailTo: string[];
  emailCc?: string[];
  emailStatus: 'sent' | 'received' | 'bounced';
}

export interface WhatsAppInteraction extends Interaction {
  type: 'whatsapp';
  phoneNumber: string;
  messageCount?: number;
}

export interface NoteInteraction extends Interaction {
  type: 'note';
  isPrivate: boolean; // Nota privada ou visível para equipe
}

export interface SalesFunnelStage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability: number;
  description?: string;
  requirements?: string[];
}

export interface Deal {
  id: string;
  organizationId: string;
  clientId: string;
  userId: string;
  funnelId: string; // ID do funil (inbound, outbound, parcerias)
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: Date;
  notes: string;
  customFields: Record<string, any>;
  tags: string[];
  nextAction?: NextAction; // Próxima ação obrigatória
  slaStatus?: 'on-time' | 'warning' | 'overdue'; // Status do SLA
  slaDueDate?: Date; // Data limite do SLA
  lostReason?: string; // Categoria principal de perda
  lostReasonDetails?: string; // Detalhes adicionais sobre a perda
  lostToCompetitor?: string; // Nome do concorrente (se aplicável)
  lostDate?: Date; // Data em que foi marcado como perdido
  wonReason?: string;
  wonDate?: Date; // Data em que foi marcado como ganho
  closedBy?: string; // ID do usuário que fechou (ganhou ou perdeu)
  lastActivityDate?: Date; // Data da última atividade
  createdAt: Date;
  updatedAt: Date;
}

// Motivos de perda estruturados
export type LostReason = 
  | 'price' // Preço
  | 'timing' // Timing/Momento
  | 'competitor' // Perdeu para concorrente
  | 'no-budget' // Cliente sem orçamento
  | 'no-decision' // Cliente não tomou decisão
  | 'bad-fit' // Falta de fit/adequação
  | 'internal-decision' // Decisão interna do cliente
  | 'no-response' // Cliente parou de responder
  | 'project-cancelled' // Projeto cancelado
  | 'other'; // Outro motivo

export interface LostReasonOption {
  id: LostReason;
  label: string;
  description: string;
  requiresCompetitor?: boolean; // Se true, pede nome do concorrente
  requiresDetails?: boolean; // Se true, pede detalhes adicionais
}

export interface Task {
  id: string;
  organizationId: string;
  userId: string;
  assignedToId?: string;
  clientId?: string;
  dealId?: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'call' | 'meeting' | 'follow-up' | 'email' | 'other';
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  organizationId: string;
  clientId: string;
  userId: string;
  title: string;
  description: string;
  items: QuoteItem[];
  total: number;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Report {
  totalClients: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  dealsByStage: { [key: string]: number };
  revenueByMonth: { [key: string]: number };
}

// Métricas agregadas por organização
export interface OrganizationMetrics {
  organizationId: string;
  period: string; // '2024-01', '2024-01-15'
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  dealsByStage: Record<string, number>;
  topPerformers: UserMetrics[];
  updatedAt: Date;
}

export interface UserMetrics {
  userId: string;
  userName: string;
  dealsCount: number;
  revenue: number;
  conversionRate: number;
}

// Planos de assinatura
export interface SubscriptionPlan {
  id: string;
  name: string;
  maxUsers: number;
  maxDeals: number;
  features: string[];
  price: number;
  currency: string;
}

// ============================================
// 🚀 FUNCIONALIDADES AVANÇADAS
// ============================================

// 🟡 MÚLTIPLOS FUNIS
export interface SalesFunnel {
  id: string;
  name: string;
  type: 'inbound' | 'outbound' | 'partnership' | 'custom';
  description: string;
  stages: SalesFunnelStage[];
  color: string;
  icon: string;
  active: boolean;
  defaultProbabilities: Record<string, number>; // Probabilidade por etapa
  createdAt: Date;
  updatedAt: Date;
}

// 🟡 PRÓXIMA AÇÃO OBRIGATÓRIA
export interface NextAction {
  id: string;
  type: 'call' | 'meeting' | 'email' | 'whatsapp' | 'proposal' | 'follow-up' | 'demo' | 'negotiation';
  title: string;
  description: string;
  dueDate: Date;
  assignedToId: string;
  completed: boolean;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderSent: boolean;
  createdAt: Date;
}

// 🟡 AUTOMAÇÃO
export interface Automation {
  id: string;
  name: string;
  description: string;
  active: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationTrigger {
  type: 'deal_created' | 'deal_stage_changed' | 'deal_idle' | 'deal_won' | 'deal_lost' | 
        'task_overdue' | 'client_created' | 'interaction_created' | 'sla_warning' | 'sla_overdue';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface AutomationAction {
  type: 'create_task' | 'send_email' | 'send_notification' | 'update_field' | 
        'assign_user' | 'add_tag' | 'create_next_action' | 'send_reminder';
  config: Record<string, any>;
}

// 🟡 SLA (Service Level Agreement)
export interface SLARule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  funnelId?: string; // Aplicar a funil específico (opcional)
  stage?: string; // Aplicar a etapa específica (opcional)
  timeLimit: number; // Tempo limite em horas
  warningThreshold: number; // % do tempo para avisar (ex: 80 = avisa aos 80%)
  actions: SLAAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAAction {
  type: 'notify_user' | 'notify_manager' | 'escalate' | 'create_task' | 'send_email';
  config: Record<string, any>;
}

// 🟡 RELATÓRIOS AVANÇADOS
export interface ForecastReport {
  organizationId: string;
  period: string; // 'month', 'quarter', 'year'
  startDate: Date;
  endDate: Date;
  totalPipeline: number; // Valor total no pipeline
  weightedPipeline: number; // Valor ponderado pela probabilidade
  expectedRevenue: number; // Receita esperada
  byStage: ForecastByStage[];
  byFunnel: ForecastByFunnel[];
  byUser: ForecastByUser[];
  confidence: 'low' | 'medium' | 'high'; // Confiança na previsão
  generatedAt: Date;
}

export interface ForecastByStage {
  stage: string;
  stageName: string;
  dealsCount: number;
  totalValue: number;
  weightedValue: number;
  probability: number;
  conversionRate: number;
}

export interface ForecastByFunnel {
  funnelId: string;
  funnelName: string;
  dealsCount: number;
  totalValue: number;
  weightedValue: number;
  conversionRate: number;
}

export interface ForecastByUser {
  userId: string;
  userName: string;
  dealsCount: number;
  totalValue: number;
  weightedValue: number;
  quota?: number; // Meta do usuário
  quotaProgress?: number; // % da meta atingida
}

export interface ConversionReport {
  organizationId: string;
  funnelId?: string;
  period: string;
  startDate: Date;
  endDate: Date;
  stages: ConversionStage[];
  overallConversion: number;
  averageTimeToClose: number; // Dias
  bottlenecks: string[]; // Etapas com baixa conversão
  generatedAt: Date;
}

export interface ConversionStage {
  stage: string;
  stageName: string;
  dealsEntered: number;
  dealsExited: number;
  dealsWon: number;
  dealsLost: number;
  conversionToNext: number; // % que avançou para próxima etapa
  conversionToWon: number; // % que fechou ganho
  averageTimeInStage: number; // Dias médios na etapa
  dropoffRate: number; // % de perda nesta etapa
}

// 🟡 NOTIFICAÇÕES E LEMBRETES
export interface Notification {
  id: string;
  organizationId: string;
  userId: string;
  type: 'task_due' | 'task_overdue' | 'deal_idle' | 'sla_warning' | 'sla_overdue' | 
        'next_action_due' | 'automation' | 'mention' | 'assignment';
  title: string;
  message: string;
  link?: string; // Link para a entidade relacionada
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
}

export interface Reminder {
  id: string;
  organizationId: string;
  userId: string;
  entityType: 'deal' | 'task' | 'client' | 'interaction';
  entityId: string;
  type: 'email' | 'push' | 'in_app';
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  message: string;
  createdAt: Date;
}

// ============================================
// 🟢 INTEGRAÇÕES, TAGS E LEAD SCORING
// ============================================

// 🟢 INTEGRAÇÕES AVANÇADAS
export interface IntegrationConfig {
  id: string;
  organizationId: string;
  type: 'whatsapp' | 'email' | 'telephony' | 'zapier' | 'webhook';
  name: string;
  enabled: boolean;
  credentials: Record<string, any>;
  settings: IntegrationSettings;
  lastSync?: Date;
  status: 'active' | 'error' | 'disabled';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationSettings {
  autoSync: boolean;
  syncInterval?: number; // minutos
  webhookUrl?: string;
  notifyOnError: boolean;
  logActivity: boolean;
}

// WhatsApp Integration
export interface WhatsAppConfig {
  provider: 'twilio' | 'evolution-api' | 'baileys' | 'wppconnect';
  accountSid?: string;
  authToken?: string;
  phoneNumber: string;
  apiUrl?: string;
  apiKey?: string;
  autoReply: boolean;
  autoReplyMessage?: string;
  createInteractionOnMessage: boolean;
  createLeadOnNewContact: boolean;
}

export interface WhatsAppMessage {
  id: string;
  organizationId: string;
  integrationId: string;
  clientId?: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  message: string;
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  createdAt: Date;
}

// Email Integration
export interface EmailConfig {
  provider: 'smtp' | 'gmail' | 'outlook' | 'sendgrid';
  host?: string;
  port?: number;
  secure?: boolean;
  username: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  autoSync: boolean;
  syncFolders?: string[];
  createInteractionOnEmail: boolean;
}

export interface EmailMessage {
  id: string;
  organizationId: string;
  integrationId: string;
  clientId?: string;
  dealId?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: EmailAttachment[];
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  openedAt?: Date;
  clickedAt?: Date;
  timestamp: Date;
  createdAt: Date;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url?: string;
}

// Telephony Integration
export interface TelephonyConfig {
  provider: 'twilio' | 'vonage' | 'plivo' | 'asterisk';
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  phoneNumbers: string[];
  recordCalls: boolean;
  transcribeCalls: boolean;
  createInteractionOnCall: boolean;
  autoCreateTask: boolean;
}

export interface CallRecord {
  id: string;
  organizationId: string;
  integrationId: string;
  clientId?: string;
  dealId?: string;
  userId?: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration: number; // segundos
  status: 'completed' | 'missed' | 'busy' | 'no-answer' | 'failed';
  recordingUrl?: string;
  transcription?: string;
  notes?: string;
  timestamp: Date;
  createdAt: Date;
}

// 🟢 TAGS E SEGMENTAÇÃO
export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  category?: string; // Ex: 'produto', 'origem', 'interesse', 'status'
  description?: string;
  entityTypes: ('client' | 'deal' | 'task')[]; // Onde pode ser usado
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Segment {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  entityType: 'client' | 'deal';
  filters: SegmentFilter[];
  color: string;
  icon?: string;
  count?: number; // Número de entidades que correspondem
  lastCalculated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 
           'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' |
           'is_empty' | 'is_not_empty' | 'starts_with' | 'ends_with';
  value: any;
  logicalOperator?: 'AND' | 'OR'; // Para combinar com próximo filtro
}

// 🟢 LEAD SCORING E IA
export interface LeadScore {
  clientId: string;
  organizationId: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: ScoreFactor[];
  lastCalculated: Date;
  trend: 'up' | 'down' | 'stable';
  previousScore?: number;
  recommendations: string[];
}

export interface ScoreFactor {
  category: 'demographic' | 'behavioral' | 'engagement' | 'firmographic' | 'custom';
  name: string;
  points: number;
  maxPoints: number;
  weight: number; // 0-1
  description: string;
}

export interface ScoringRule {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  active: boolean;
  category: 'demographic' | 'behavioral' | 'engagement' | 'firmographic' | 'custom';
  conditions: ScoringCondition[];
  points: number;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoringCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AIInsight {
  id: string;
  organizationId: string;
  entityType: 'client' | 'deal' | 'organization';
  entityId: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestedActions?: string[];
  metadata?: Record<string, any>;
  dismissed: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface DealPrediction {
  dealId: string;
  organizationId: string;
  winProbability: number; // 0-1
  expectedCloseDate: Date;
  expectedValue: number;
  riskFactors: string[];
  opportunities: string[];
  similarDeals: string[]; // IDs de deals similares
  confidence: number;
  calculatedAt: Date;
}

export interface ChurnRisk {
  clientId: string;
  organizationId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
  lastInteractionDate?: Date;
  daysSinceLastInteraction: number;
  calculatedAt: Date;
}
