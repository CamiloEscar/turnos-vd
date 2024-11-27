import React, { useEffect, useState, useMemo } from 'react';
import { Clock, CheckCircle, Users, Bell, ArrowRight, Volume2 } from 'lucide-react';
import { useTicketStore } from '../lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

//TODO: colocar canal video digital

export default function DisplayView() {
  const { tickets, fetchTickets, deleteTicket } = useTicketStore();
  const [lastPlayedTicket, setLastPlayedTicket] = useState(null);
  const [notification] = useState(() => typeof Audio !== 'undefined' ? new Audio('/notification.mp3') : null);

  // Memoized ticket categorization with improved sorting
  const {
    currentTickets,
    lastCompleted,
    nextTickets
  } = useMemo(() => ({
    currentTickets: tickets.filter(t => t.status === 'serving'),
    lastCompleted: tickets
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 6),
    nextTickets: tickets
      .filter(t => t.status === 'waiting')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(0, 3)
  }), [tickets]);

  // Fetch tickets periodically
  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Play sound when new ticket is called
  useEffect(() => {
    if (currentTickets.length > 0) {
      const latestTicket = currentTickets[0];
      if (lastPlayedTicket !== latestTicket.id) {
        notification?.play().catch(error => console.log('Audio playback error:', error));
        setLastPlayedTicket(latestTicket.id);
      }
    }
  }, [currentTickets, lastPlayedTicket, notification]);

  const CategoryBadge = ({ categoryId }) => {
    const categories = {
      1: { label: 'General', color: 'bg-blue-100 text-blue-800' },
      2: { label: 'Preferencial', color: 'bg-amber-100 text-amber-800' },
      3: { label: 'VIP', color: 'bg-emerald-100 text-emerald-800' }
    };
    
    const category = categories[categoryId] || categories[1];
    
    return (
      <Badge className={`${category.color} ml-2`}>
        {category.label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Current Tickets */}
      <Card className="lg:col-span-2 shadow-xl bg-white/90 backdrop-blur border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-8 h-8" />
            <CardTitle className="text-3xl font-bold">
              En Atención
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {currentTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className="relative bg-gradient-to-br from-white to-blue-50 
                             border-2 border-blue-200 rounded-2xl 
                             shadow-2xl transform hover:scale-105 
                             transition-all duration-300 
                             text-center p-8 space-y-6 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 m-4">
                    <CategoryBadge categoryId={ticket.category_id} />
                  </div>
                  <div className="text-8xl font-bold text-blue-600 animate-pulse mb-4 tracking-wider">
                    {ticket.number}
                  </div>
                  <div className="space-y-3">
                    <div className="text-2xl font-medium text-gray-800 truncate px-4">
                      {ticket.customer_name || 'Cliente'}
                    </div>
                    <div className="text-xl font-bold text-blue-500 bg-blue-50 rounded-full py-2 px-4 inline-block">
                      Caja {ticket.counter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16 text-xl font-medium">
              No hay turnos en atención
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Panel */}
      <div className="space-y-6">
        {/* Next Tickets */}
        <Card className="shadow-lg bg-white/90 backdrop-blur border-0">
          <CardHeader className="border-b bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <ArrowRight className="w-6 h-6" />
              <CardTitle className="text-xl font-bold">
                Próximos Turnos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {nextTickets.length > 0 ? (
              <div className="space-y-3">
                {nextTickets.map((ticket, index) => (
                  <div 
                    key={ticket.id} 
                    className={`flex items-center justify-between 
                               bg-gradient-to-r ${index === 0 ? 'from-green-50 to-white' : 'from-gray-50 to-white'}
                               border border-gray-100 
                               rounded-xl p-4 
                               shadow-md hover:shadow-lg 
                               transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`text-2xl font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        {ticket.number}
                      </span>
                      <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">
                        {ticket.customer_name || 'Cliente'}
                      </span>
                    </div>
                    <CategoryBadge categoryId={ticket.category_id} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                No hay turnos en espera
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Completed */}
        <Card className="shadow-lg bg-white/90 backdrop-blur border-0">
          <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6" />
              <CardTitle className="text-xl font-bold">
                Últimos Atendidos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {lastCompleted.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {lastCompleted.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className="flex flex-col bg-white 
                               border border-gray-100 
                               rounded-xl p-4 
                               shadow-md hover:shadow-lg 
                               transition-all duration-300
                               overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-purple-600">
                        {ticket.number}
                      </span>
                      <CategoryBadge categoryId={ticket.category_id} />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-gray-600 truncate">
                        {ticket.customer_name || 'Cliente'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Caja {ticket.counter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                No hay turnos completados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}