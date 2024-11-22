import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { io } from 'socket.io-client';
import type { Ticket, Category, Stats, CreateTicketOptions } from './types';

const BACKEND_URL = `http://${window.location.hostname}:3000`;
const socket = io(BACKEND_URL);

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
  updateTicket: (id: number, status: Ticket['status'], counter: number) => Promise<void>;
  setError: (error: string | null) => void;
  handleNewTicket: (ticket: Ticket) => void;
  handleTicketUpdate: (ticket: Ticket) => void;
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
            const response = await fetch(`${BACKEND_URL}/api/tickets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(options),
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to create ticket');
            }
            const ticket = await response.json();
            // Let the socket event handle the store update
            set({ loading: false });
            return ticket;
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
            return null;
          }
        },

        fetchTickets: async () => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${BACKEND_URL}/api/tickets`);
            if (!response.ok) {
              throw new Error('Failed to fetch tickets');
            }
            const tickets = await response.json();
            set({ tickets, loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
          }
        },

        fetchCategories: async () => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${BACKEND_URL}/api/categories`);
            if (!response.ok) {
              throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();
            set({ categories, loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
          }
        },

        fetchStats: async () => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${BACKEND_URL}/api/stats`);
            if (!response.ok) {
              throw new Error('Failed to fetch stats');
            }
            const stats = await response.json();
            set({ stats, loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
          }
        },

        updateTicket: async (id, status, counter) => {
          if (get().loading) return;
          
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${BACKEND_URL}/api/tickets/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, counter }),
            });
            if (!response.ok) {
              throw new Error('Failed to update ticket');
            }
            const updatedTicket = await response.json();
            // Let the socket event handle the store update
            set({ loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
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
      }),
      {
        name: 'ticket-store',
        getStorage: () => localStorage,
      }
    )
  )
);

// Socket.IO event listeners
socket.on('newTicket', (ticket: Ticket) => {
  useTicketStore.getState().handleNewTicket(ticket);
});

socket.on('ticketUpdate', (updatedTicket: Ticket) => {
  useTicketStore.getState().handleTicketUpdate(updatedTicket);
});

export default useTicketStore;

