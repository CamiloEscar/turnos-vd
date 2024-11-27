import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { io } from 'socket.io-client';
import type { Ticket, Category, Stats, CreateTicketOptions } from './types';

// Determinar la URL base para las peticiones
const BASE_URL = import.meta.env.PROD 
  ? window.location.origin  // En producción, usa el mismo origen
  : '';  // En desarrollo, usa el proxy de Vite

// Configuración del socket
const socket = io(BASE_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});


// Función helper para hacer fetch con mejor manejo de errores
const fetchWithError = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      }
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (isJson) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (!isJson) {
      console.warn('Response is not JSON:', await response.text());
      throw new Error('Invalid response format');
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', {
      url,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

interface TicketStore {
  tickets: Ticket[];
  categories: Category[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  
  createTicket: (options: CreateTicketOptions) => Promise<Ticket | null>;
  fetchTickets: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateTicket: (id: number, status: Ticket['status'], counter: number, technical_notes?: string | null) => Promise<void>;
  setError: (error: string | null) => void;
  handleNewTicket: (ticket: Ticket) => void;
  handleTicketUpdate: (ticket: Ticket) => void;
  deleteTicket: (id: number) => Promise<void>;
  getWaitingInfo: () => { waitingCount: number; avgWaitTime: number };
}

export const useTicketStore = create<TicketStore>()(
  devtools(
    persist(
      (set, get) => ({
        tickets: [],
        categories: [],
        stats: null,
        loading: false,
        error: null,

        createTicket: async (options) => {
          if (get().loading) return null;
          
          set({ loading: true, error: null });
          try {
            console.log('Creating ticket with options:', options);
            // Exclude 'type' from options if it exists
            const { type, ...ticketData } = options; // Ensure 'type' is not included
            const ticket = await fetchWithError('/api/tickets', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(ticketData) // Use ticketData instead of options
            });
            console.log('Ticket created successfully:', ticket);
            set({ loading: false });
            return ticket;
          } catch (error) {
            console.error('Error creating ticket:', {
              options,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create ticket', 
              loading: false 
            });
            return null;
          }
        },

        fetchTickets: async () => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const tickets = await fetchWithError('/api/tickets');
            console.log('Tickets recibidos:', tickets);
            set({ tickets, loading: false });
          } catch (error) {
            console.error('Error fetching tickets:', error);
            set({ error: (error as Error).message, loading: false });
          }
        },

        fetchCategories: async () => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const categories = await fetchWithError('/api/categories');
            set({ categories, loading: false });
          } catch (error) {
            console.error('Error fetching categories:', error);
            set({ error: (error as Error).message, loading: false });
          }
        },

        fetchStats: async () => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const stats = await fetchWithError('/api/stats');
            set({ stats, loading: false });
          } catch (error) {
            console.error('Error fetching stats:', error);
            set({ error: (error as Error).message, loading: false });
          }
        },

        updateTicket: async (id, status, counter, technical_notes) => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            // Validar datos antes de enviar
            if (!id || !status) {
              throw new Error('Datos de ticket inválidos');
            }
        
            const response = await fetchWithError(`/api/tickets/${id}`, {
              method: 'PUT',
              body: JSON.stringify({ 
                status, 
                counter,
                technical_notes: technical_notes ? JSON.stringify(technical_notes) : null, // Asegúrate de incluirlo aquí
                updated_at: new Date().toISOString()
              }),
            });
        
            // Verificar la respuesta del servidor
            if (!response) {
              throw new Error('No se recibió respuesta del servidor');
            }
        
            set({ loading: false });
            return response;
          } catch (error) {
            console.error('Error detallado al actualizar ticket:', {
              ticketId: id,
              status,
              counter,
              errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });
        
            set({ 
              error: error instanceof Error 
                ? `Error al actualizar ticket: ${error.message}` 
                : 'Error desconocido al actualizar ticket', 
              loading: false 
            });
        
            // Lanzar el error para que el componente pueda manejarlo
            throw error;
          }
        },

        handleNewTicket: (ticket: Ticket) => {
          set(state => ({
            tickets: [ticket, ...state.tickets]
          }));
          get().fetchStats();
        },

        handleTicketUpdate: (ticket: Ticket) => {
          set(state => ({
            tickets: state.tickets.map(t => t.id === ticket.id ? ticket : t)
          }));
          get().fetchStats();
        },

        setError: (error) => set({ error }),

        deleteTicket: async (id: number) => {
          if (get().loading) return;
      
          set({ loading: true, error: null });
          try {
              console.log(`Attempting to delete ticket with ID: ${id}`); // Add logging
              const response = await fetchWithError(`/api/tickets/${id}`, {
                  method: 'DELETE',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });
              
              console.log('Delete response:', response); // Log the response
              
              set(state => ({
                  tickets: state.tickets.filter(t => t.id !== id),
                  loading: false
              }));
          } catch (error) {
              console.error('Detailed error deleting ticket:', {
                  ticketId: id,
                  error: error instanceof Error ? error.message : 'Unknown error'
              });
      
              set({ 
                  error: error instanceof Error 
                      ? `Error deleting ticket: ${error.message}` 
                      : 'Failed to delete ticket',
                  loading: false 
              });
      
              // Optionally rethrow to allow caller to handle
              throw error;
          }
      },

        getWaitingInfo: () => {
          const tickets = get().tickets;
          const waitingCount = tickets.filter(t => t.status === "waiting").length;
          const completedToday = tickets.filter(t => 
            t.status === "completed" && 
            new Date(t.created_at).toDateString() === new Date().toDateString()
          );
          
          const avgWaitTime = completedToday.length > 0
            ? completedToday.reduce((acc, t) => acc + (t.estimated_time || 0), 0) / completedToday.length
            : 0;

          return {
            waitingCount,
            avgWaitTime: Math.round(avgWaitTime)
          };
        },
      }),
      {
        name: 'ticket-store',
        storage: createJSONStorage(() => localStorage),
        version: 1,
      }
    )
  )
);

// Logging de eventos del socket
socket.on('connect', () => {
  console.log('Socket connected successfully:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Socket.IO event listeners
socket.on('newTicket', (ticket: Ticket) => {
  useTicketStore.getState().handleNewTicket(ticket);
});

socket.on('ticketUpdate', (updatedTicket: Ticket) => {
  useTicketStore.getState().handleTicketUpdate(updatedTicket);
});

export default useTicketStore;

