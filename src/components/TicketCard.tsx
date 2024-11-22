import { Play, CheckCircle } from 'lucide-react';
import { type Ticket } from '../lib/types';

interface TicketCardProps {
  ticket: Ticket;
  onAction?: () => void;
  actionType?: 'call' | 'complete';
  disabled?: boolean;
}

export default function TicketCard({ ticket, onAction, actionType, disabled }: TicketCardProps) {
  const getStatusColor = () => {
    switch (ticket.status) {
      case 'serving': return 'bg-blue-50';
      case 'completed': return 'bg-gray-50';
      default: return 'bg-gray-50';
    }
  };

  const getActionButton = () => {
    if (!onAction) return null;

    if (actionType === 'call') {
      return (
        <button
          onClick={onAction}
          disabled={disabled}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2
                   hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          Llamar
        </button>
      );
    }

    if (actionType === 'complete') {
      return (
        <button
          onClick={onAction}
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2
                   hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          Completar
        </button>
      );
    }
  };

  return (
    <div className={`flex items-center justify-between ${getStatusColor()} p-4 rounded-lg`}>
      <div>
        <span className={`text-2xl font-bold ${ticket.status === 'serving' ? 'text-blue-600' : 'text-gray-900'}`}>
          {ticket.number || 'N/A'}
        </span>
        {ticket.counter && (
          <span className="ml-3 text-gray-600">
            Módulo {ticket.counter}
          </span>
        )}
      </div>
      {getActionButton()}
    </div>
  );
}

