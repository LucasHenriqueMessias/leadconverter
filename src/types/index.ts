// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  segment: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  clientId: string;
  userId: string;
  type: 'call' | 'meeting' | 'whatsapp' | 'email' | 'note';
  description: string;
  date: Date;
  attachments?: string[];
  createdAt: Date;
}

export interface SalesFunnelStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Deal {
  id: string;
  clientId: string;
  userId: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  clientId?: string;
  dealId?: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'call' | 'meeting' | 'follow-up' | 'email' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  clientId: string;
  userId: string;
  title: string;
  description: string;
  items: QuoteItem[];
  total: number;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
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
