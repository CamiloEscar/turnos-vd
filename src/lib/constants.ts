import React from 'react';
import {
  FileQuestion,
  Wrench,
  Network,
  Laptop,
  CreditCard,
  AlertTriangle,
  Settings,
  Power,
  RefreshCw,
  Receipt,
  Shield,
  MessageCircle,
  Ban,
  HelpCircle
} from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import type { CategoryType } from './types';

type ColorConfig = {
  bg: string;
  border: string;
  text: string;
  icon: string;
};

export const COLORS: Record<string, ColorConfig> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'bg-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'bg-green-100'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'bg-amber-100'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'bg-red-100'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'bg-purple-100'
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: 'bg-gray-100'
  }
};

export const CATEGORY_CONFIGS: Record<CategoryType, {
  icon: LucideIcon;
  color: string;
  description: string;
}> = {
  information: {
    icon: FileQuestion,
    color: 'blue',
    description: "Información general y consultas básicas"
  },
  tech_support: {
    icon: Wrench,
    color: 'amber',
    description: "Soporte técnico y reparaciones"
  },
  network: {
    icon: Network,
    color: 'amber',
    description: "Problemas de conexión y red"
  },
  hardware: {
    icon: Laptop,
    color: 'amber',
    description: "Reparación de equipos y hardware"
  },
  billing: {
    icon: Receipt,
    color: 'green',
    description: "Facturación y pagos"
  },
  payment: {
    icon: CreditCard,
    color: 'green',
    description: "Pagos y transacciones"
  },
  complaint: {
    icon: AlertTriangle,
    color: 'red',
    description: "Reclamos y quejas"
  },
  priority: {
    icon: Shield,
    color: 'purple',
    description: "Atención prioritaria"
  },
  onboarding: {
    icon: Power,
    color: 'green',
    description: "Alta de servicios"
  },
  termination: {
    icon: Ban,
    color: 'red',
    description: "Baja de servicios"
  },
  modification: {
    icon: Settings,
    color: 'blue',
    description: "Modificación de servicios"
  },
  refund: {
    icon: RefreshCw,
    color: 'purple',
    description: "Reembolsos"
  },
  customer_experience: {
    icon: MessageCircle,
    color: 'blue',
    description: "Experiencia del cliente"
  },
  compensation: {
    icon: Shield,
    color: 'purple',
    description: "Compensaciones"
  }
}; 