import { useMemo } from 'react';
import type { Ticket } from '@/lib/types';

export function useTimeInfo(tickets: Ticket[]) {
  return useMemo(() => {
    const calculateWaitTime = (ticket: Ticket) => {
      const now = new Date();
      const createdAt = new Date(ticket.created_at);
      
      if (createdAt > now) {
        console.warn('Fecha de creación futura detectada:', ticket);
        return 0;
      }

      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return Math.max(0, diffMins);
    };

    const calculateAverageTime = (tickets: Ticket[]) => {
      if (!tickets.length) return 0;
      const total = tickets.reduce((sum, ticket) => sum + calculateWaitTime(ticket), 0);
      return Math.round(total / tickets.length);
    };

    const getTimeString = (minutes: number) => {
      if (!minutes || minutes < 0) return '0 min';
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    };

    return {
      calculateWaitTime,
      calculateAverageTime,
      getTimeString,
    };
  }, []);
} 