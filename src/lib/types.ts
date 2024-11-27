// types.ts
export type CategoryType = 
  | 'information' 
  | 'priority'
  | 'onboarding'
  | 'termination'
  | 'modification'
  | 'billing'
  | 'payment'
  | 'refund'
  | 'tech_support'
  | 'network'
  | 'hardware'
  | 'complaint'
  | 'customer_experience'
  | 'compensation';

export interface Category {
  description: string;
  id: number;
  name: string;
  prefix: string;
  priority: number;
  type?: CategoryType;
  estimated_service_time: number;
}

export interface TechnicalNotes {
  diagnosis: string;
  solution?: string;
  nextCheckDate?: string;
  notes?: string;
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'requiere_seguimiento';
  claimDetails?: {
    description: string;
    severity: 'baja' | 'media' | 'alta' | 'crítica';
    category: string;
    resolution?: string;
    followUpDate?: string;
  };
}

export interface Ticket {
  id: number;
  number: string;
  category_id: number;
  category_name?: string;
  category_type?: CategoryType;
  prefix?: string;
  status: 'waiting' | 'serving' | 'completed' | 'missed';
  sub_status?: string;
  counter?: number;
  priority: number;
  estimated_time: number;
  complexity?: number;
  created_at: string;
  updated_at: string;
  
  // New optional fields
  customer_name?: string;
  contact_info?: string;
  additional_notes?: string;
  technical_notes?: TechnicalNotes;
}

export interface Stats {
  avg_wait_time: number;
  waiting_count: number;
  serving_count: number;
  completed_count: number;
  avg_service_time: number;
  
  // New stats fields
  billing_tickets: number;
  tech_support_tickets: number;
  complaint_tickets: number;
  priority_tickets: number;
  high_priority_tickets: number;
}

export interface CreateTicketOptions {
  categoryId: number;
  customerName?: string;
  status?: 'waiting' | 'in_progress' | 'completed';
  contactInfo?: string;
  additionalNotes?: string;
  complexityFactor?: number;
  estimatedTime?: number;
  type?: CategoryType;
}

export type CounterType = {
  id: number;
  name: string;
  type: 'regular' | 'tech';
  color: string;
};