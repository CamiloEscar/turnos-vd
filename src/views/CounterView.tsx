'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useTicketStore } from "../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  Archive,
  Timer,
  RotateCcw,
  User,
  ChevronRight,
  AlertCircle,
  Wrench,
  Trash2,
  Laptop,
  Phone,
  Volume2,
  NotebookPen,
  MessageSquare,
  Eye,
  Search,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import InternalChat from "@/components/InternalChat";
import TechServiceDialog from "@/components/TechServiceDialog";
import TechServiceNotes from "@/components/TechServiceNotes";
import { useTimeInfo } from '@/hooks/useTimeInfo';
import type { Ticket, CounterType } from "../lib/types";
import { ComplaintDetails } from "@/components/complaint-details";
import { Input } from "@/components/ui/input";

const COUNTER_TYPES: CounterType[] = [
  { id: 1, name: 'Caja 1', type: 'regular', color: 'blue' },
  { id: 2, name: 'Caja 2', type: 'regular', color: 'blue' },
  { id: 3, name: 'Caja 3', type: 'regular', color: 'blue' },
  { id: 4, name: 'Caja 4', type: 'regular', color: 'blue' },
  { id: 5, name: 'Servicio Técnico 1', type: 'tech', color: 'amber' },
  { id: 6, name: 'Servicio Técnico 2', type: 'tech', color: 'amber' }
];

export default function CombinedCounterView() {
  const { tickets, fetchTickets, updateTicket, loading, error, deleteTicket } = useTicketStore();
  const [counterNumber, setCounterNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("waiting");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [complaintDetailsOpen, setComplaintDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pastTicketsOpen, setPastTicketsOpen] = useState(false);
  const timeInfo = useTimeInfo(tickets);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const currentCounter = COUNTER_TYPES.find(c => c.id === counterNumber);
  const isTechCounter = currentCounter?.type === 'tech';

  const { waitingTickets, currentTicket, completedTickets, missedTickets } = useMemo(() => {
    const techPrefixes = ['ST', 'PC', 'RE', 'RC'];
  
    return {
      waitingTickets: tickets.filter((t) => {
        const isWaiting = t.status === "waiting";
        const prefix = t.number?.slice(0, 2);
        
        // Para Servicio Técnico
        if (isTechCounter) {
          return isWaiting && 
                 (prefix && techPrefixes.includes(prefix) || 
                  t.category_type === 'complaint') && 
                 (!t.counter || t.counter === counterNumber || 
                  (t.counter && t.counter >= 5 && t.counter <= 6));
        } 
        
        // Para cajas regulares
        return isWaiting && 
               (!prefix || !techPrefixes.includes(prefix)) && 
               (!t.counter || t.counter === counterNumber || 
                (t.counter && t.counter >= 1 && t.counter <= 4));
      }),
      currentTicket: tickets.find(
        (t) => t.status === "serving" && t.counter === counterNumber
      ),
      completedTickets: tickets.filter(
        (t) => t.status === "completed" && t.counter === counterNumber
      ),
      missedTickets: tickets.filter(
        (t) => t.status === "missed" && t.counter === counterNumber
      ),
    };
  }, [tickets, counterNumber, isTechCounter]);
  // Search and filter for past tickets
  const filteredPastTickets = useMemo(() => {
    return tickets.filter(ticket => 
      (ticket.status === "completed" || ticket.status === "missed") &&
      (
        ticket.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.contact_info?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [tickets, searchQuery]);

  const handleUpdateTicket = useCallback(
    async (ticketId: number, newStatus: 'serving' | 'completed' | 'missed' | 'waiting', techData?: any) => {
      try {
        if (newStatus === 'serving') {
          const ticket = tickets.find(t => t.id === ticketId);
          if (ticket) {
            await callTicket(ticket);
          }
        }

        await updateTicket(ticketId, newStatus, counterNumber, techData?.technical_notes);
        
        toast({
          title: "Ticket actualizado",
          description: `El ticket ha sido ${
            newStatus === 'completed' ? 'completado' : 
            newStatus === 'missed' ? 'marcado como perdido' : 
            'actualizado'
          }`,
        });
        
        setSelectedTicket(null);
        setDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el ticket. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        });
      }
    },
    [updateTicket, counterNumber, tickets]
  );

  const callTicket = useCallback(async (ticket: Ticket) => {
    try {
      const speech = new SpeechSynthesisUtterance(
        `Ticket número ${ticket.number}, por favor acercarse a ${
          isTechCounter ? `Servicio Técnico ${counterNumber - 4}` : `Caja ${counterNumber}`
        }`
      );
      window.speechSynthesis.speak(speech);

      try {
        const audio = new Audio('/call-sound.mp3');
        await audio.play();
      } catch (audioError) {
        console.warn('Error con el audio:', audioError);
      }

      toast({
        title: "Llamando ticket",
        description: `Llamando al ticket ${ticket.number}`,
      });
    } catch (error) {
      console.error('Error al llamar ticket:', error);
      toast({
        title: "Ticket llamado",
        description: `Ticket ${ticket.number} llamado (sin audio)`,
      });
    }
  }, [counterNumber, isTechCounter]);

  const handleNotesSubmit = async (data: any) => {
    if (!selectedTicket) return;
    try {
      await updateTicket(selectedTicket.id, selectedTicket.status, counterNumber, data);
      toast({
        title: "Notas guardadas",
        description: "Las notas técnicas han sido guardadas exitosamente",
      });
      setNotesDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las notas",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId);
      toast({
        title: "Ticket eliminado",
        description: "El ticket ha sido eliminado exitosamente",
      });
    } catch (error) {
      console.error('Full delete error:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el ticket: ${error}`,
        variant: "destructive",
      });
    }
  };

  const renderTicketInfo = (ticket: Ticket) => {
    const waitTime = timeInfo.calculateWaitTime(ticket);
    const isLongWait = waitTime > 30;

    return (
      <div className="flex items-center gap-2">
        {ticket.status === "waiting" && (
          <Badge 
            variant="outline" 
            className={`${isLongWait ? 'bg-red-50 text-red-700' : 'text-gray-600'}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Espera: {timeInfo.getTimeString(waitTime)}
          </Badge>
        )}
        <Badge variant="outline" className="text-gray-600">
          <Timer className="h-3 w-3 mr-1" />
          Estimado: {timeInfo.getTimeString(ticket.estimated_time)}
        </Badge>
      </div>
    );
  };

  const renderTicketActions = (ticket: Ticket, isPastTicket = false) => (
    <div className="flex items-center gap-2">
      {!isPastTicket && renderTicketInfo(ticket)}
      {ticket.status === "waiting" && !isPastTicket && (
        <>
          <Button
            onClick={() => handleUpdateTicket(ticket.id, "serving")}
            disabled={!!currentTicket || loading}
            size="sm"
            className={`bg-${currentCounter?.color}-500 hover:bg-${currentCounter?.color}-600 text-white border border-${currentCounter?.color}-600`}
            style={{color: 'white'}} // Ensure text is white
          >
            <ChevronRight className="h-4 w-4 mr-1" />
            {isTechCounter ? 'Atender' : 'Llamar'}
          </Button>
          <Button
            onClick={() => {
              setSelectedTicket(ticket);
              setComplaintDetailsOpen(true);
            }}
            size="sm"
            variant="outline"
            className={`border-${currentCounter?.color}-200 hover:bg-${currentCounter?.color}-50 text-${currentCounter?.color}-700`}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </Button>
          <Button
            onClick={() => handleDeleteTicket(ticket.id)}
            variant="destructive"
            size="sm"
            className="ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      {ticket.status === "serving" && !isPastTicket && (
        <>
          <Button
            onClick={() => handleUpdateTicket(ticket.id, "completed")}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setSelectedTicket(ticket);
              setNotesDialogOpen(true);
            }}
            variant="outline"
            size="sm"
            className="border-amber-200 hover:bg-amber-50 text-amber-700"
          >
            <NotebookPen className="h-4 w-4 mr-1" />
            Notas
          </Button>
          <Button
            onClick={() => callTicket(ticket)}
            variant="outline"
            size="sm"
            className="border-amber-200 hover:bg-amber-50 text-amber-700"
          >
            <Volume2 className="h-4 w-4 mr-1" />
            Rellamar
          </Button>
          <Button
            onClick={() => handleUpdateTicket(ticket.id, "missed")}
            size="sm"
            variant="destructive"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleDeleteTicket(ticket.id)}
            variant="destructive"
            size="sm"
            className="ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      {ticket.status === "missed" && !isPastTicket && (
        <>
          <Button
            onClick={() => handleUpdateTicket(ticket.id, "waiting")}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-red-200 hover:bg-red-50 text-red-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleDeleteTicket(ticket.id)}
            variant="destructive"
            size="sm"
            className="ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      {(ticket.status === "completed" || isPastTicket) && (
        <>
          <Button
            onClick={() => {
              setSelectedTicket(ticket);
              setComplaintDetailsOpen(true);
            }}
            size="sm"
            variant="outline"
            className="border-green-200 hover:bg-green-50 text-green-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </Button>
          {!isPastTicket && (
            <Button
              onClick={() => handleDeleteTicket(ticket.id)}
              variant="destructive"
              size="sm"
              className="ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
  const renderTicketCard = (ticket: Ticket, actions = true, isPastTicket = false) => (
    <Card
      key={`ticket-${ticket.id}-${ticket.status}`}
      className={`transition-all duration-200 border-l-4 ${
        ticket.status === "serving"
          ? "border-l-green-500 bg-green-50"
          : ticket.status === "waiting"
          ? `border-l-${currentCounter?.color}-500 hover:bg-${currentCounter?.color}-50`
          : ticket.status === "missed"
          ? "border-l-red-500 hover:bg-red-50"
          : "border-l-gray-500 hover:bg-gray-50"
      }`}
    >
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div
              className={`rounded-full p-2 ${
                ticket.category_type === 'complaint' ? 'bg-red-100 text-red-800' :
                isTechCounter ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {ticket.category_type === 'complaint' ? <MessageSquare className="h-4 w-4" /> :
               isTechCounter ? <Laptop className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {ticket.number || "N/A"}
              </span>
              {ticket.customer_name && (
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {ticket.customer_name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {ticket.category_name}
                {ticket.category_type === 'complaint' && (
                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Reclamo
                  </Badge>
                )}
              </span>
              <Badge
                variant="outline"
                className={
                  ticket.status === "serving"
                    ? "text-green-600 bg-green-100"
                    : ticket.status === "waiting"
                    ? `text-${currentCounter?.color}-600 bg-${currentCounter?.color}-100`
                    : ticket.status === "missed"
                    ? "text-red-600 bg-red-100"
                    : "text-gray-600 bg-gray-100"
                }
              >
                {ticket.status === "waiting" && "En espera"}
                {ticket.status === "serving" && "En atención"}
                {ticket.status === "completed" && "Completado"}
                {ticket.status === "missed" && "Perdido"}
              </Badge>
            </div>
            {ticket.contact_info && (
              <div className="flex items-center gap-2 text-sm mt-1">
                <Phone className="h-3 w-3" />
                <span>{ticket.contact_info}</span>
              </div>
            )}
            {ticket.additional_notes && (
              <p className="text-sm text-gray-600 mt-1">
                {ticket.additional_notes}
              </p>
            )}
            {ticket.technical_notes?.diagnosis && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">Diagnóstico:</p>
                <p className="text-sm text-gray-600">{ticket.technical_notes.diagnosis}</p>
              </div>
            )}
          </div>
        </div>
        {actions && renderTicketActions(ticket, isPastTicket)}
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Counter Area */}
        <div className="lg:w-2/3 space-y-6">
          {/* Counter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                value={counterNumber.toString()}
                onValueChange={(value) => setCounterNumber(Number(value))}
              >
                <SelectTrigger className={`w-[200px] bg-${currentCounter?.color}-100 text-${currentCounter?.color}-800`}>
                  <SelectValue placeholder="Seleccionar caja" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTER_TYPES.map((counter) => (
                    <SelectItem 
                      key={`counter-${counter.id}`} 
                      value={counter.id.toString()}
                      className={counter.type === 'tech' ? 'text-amber-600' : 'text-blue-600'}
                    >
                      {counter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <h1 className="text-2xl font-bold">
                {isTechCounter ? 'Panel de Servicio Técnico' : 'Panel de Atención'}
              </h1>
            </div>
            {loading && (
              <Badge variant="outline" className="animate-pulse">
                Actualizando...
              </Badge>
            )}
          </div>

          {/* Current Ticket Section */}
          <Card className={`border-2 border-${currentCounter?.color}-200 bg-${currentCounter?.color}-50`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg text-${currentCounter?.color}-800`}>
                {isTechCounter ? 'Caso en Atención' : 'Turno Actual'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTicket ? (
                renderTicketCard(currentTicket)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isTechCounter ? <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-400" /> : <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />}
                  <p>No hay {isTechCounter ? 'caso' : 'turno'} en atención</p>
                  <p className="text-sm">
                    Seleccione "{isTechCounter ? 'Atender' : 'Llamar'}" en un {isTechCounter ? 'caso' : 'turno'} pendiente para comenzar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardContent className="p-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger
                    value="waiting"
                    className={`data-[state=active]:bg-${currentCounter?.color}-100 data-[state=active]:text-${currentCounter?.color}-800`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pendientes ({waitingTickets.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="missed"
                    className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Perdidos ({missedTickets.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completados ({completedTickets.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="waiting" className="space-y-2">
                  {waitingTickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay {isTechCounter ? 'casos' : 'turnos'} en espera</p>
                    </div>
                  ) : (
                    waitingTickets.map((ticket) => renderTicketCard(ticket))
                  )}
                </TabsContent>

                <TabsContent value="missed" className="space-y-2">
                  {missedTickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Archive className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay {isTechCounter ? 'casos' : 'turnos'} perdidos</p>
                    </div>
                  ) : (
                    missedTickets.map((ticket) => renderTicketCard(ticket))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-2">
                  {completedTickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay {isTechCounter ? 'casos' : 'turnos'} completados</p>
                    </div>
                  ) : (
                    completedTickets.map((ticket) => renderTicketCard(ticket, false))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <div className="lg:w-1/3">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center">
                <Archive className="h-5 w-5 mr-2 text-gray-600" />
                Resumen del Día
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPastTicketsOpen(!pastTicketsOpen)}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Turnos
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className={`bg-${currentCounter?.color}-50 border-${currentCounter?.color}-200`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className={`text-sm text-${currentCounter?.color}-800 font-medium`}>
                      En Espera
                    </p>
                    <p className={`text-3xl font-bold text-${currentCounter?.color}-700`}>
                      {waitingTickets.length}
                    </p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 text-${currentCounter?.color}-600`} />
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      {isTechCounter ? 'Casos' : 'Turnos'} Completados
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {completedTickets.length}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      {isTechCounter ? 'Casos' : 'Turnos'} Perdidos
                    </p>
                    <p className="text-2xl font-bold text-red-700">
                      {missedTickets.length}
                    </p>
                  </div>
                  <Archive className="h-6 w-6 text-red-600" />
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Tiempo Promedio
                    </p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {completedTickets.length > 0
                        ? `${Math.round(
                            completedTickets.reduce(
                              (sum, ticket) =>
                                sum + timeInfo.calculateWaitTime(ticket),
                              0
                            ) / completedTickets.length
                          )} min`
                        : "- min"}
                    </p>
                  </div>
                  <Timer className="h-6 w-6 text-yellow-600" />
                </CardContent>
              </Card>
            </CardContent>
            <InternalChat currentModule={`${isTechCounter ? 'Técnico' : 'Caja'} ${counterNumber}`} />
          </Card>
        </div>
      </div>

      {/* Past Tickets Search Modal */}
      {pastTicketsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[90%] max-w-4xl max-h-[90vh] flex flex-col">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Buscar turnos pasados..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button variant="outline" onClick={() => setPastTicketsOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {filteredPastTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No se encontraron turnos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPastTickets.map((ticket) => renderTicketCard(ticket, true, true))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diálogos para todos los tipos de tickets */}
      {selectedTicket && (
        <>
          <TechServiceDialog
            ticket={selectedTicket}
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={(data) => handleUpdateTicket(selectedTicket.id, "serving", data)}
            onDelete={() => handleDeleteTicket(selectedTicket.id)}
            onRecall={() => callTicket(selectedTicket)}
          />
          <TechServiceNotes
            ticket={selectedTicket}
            isOpen={notesDialogOpen}
            onOpenChange={setNotesDialogOpen}
            onSubmit={handleNotesSubmit}
          />
          <ComplaintDetails
            ticket={selectedTicket}
            isOpen={complaintDetailsOpen}
            onOpenChange={setComplaintDetailsOpen}
          />
        </>
      )}
    </div>
  );
}

