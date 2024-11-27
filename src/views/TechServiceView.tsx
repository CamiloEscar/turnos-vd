// import React, { useEffect, useState, useCallback } from "react";
// import { useTicketStore } from "../lib/store";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Wrench, 
//   CheckCircle, 
//   Clock, 
//   Timer, 
//   Laptop,
//   AlertTriangle,
//   User,
//   Phone,
//   ChevronRight,
//   NotebookPen,
//   Volume2,
//   SkipForward,
// } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import TechServiceDialog from "@/components/TechServiceDialog";
// import TechServiceNotes from "@/components/TechServiceNotes";
// import InternalChat from "@/components/InternalChat";
// import type { Ticket, TechnicalNotes } from "@/lib/types";
// import { useTimeInfo } from '@/hooks/useTimeInfo';

// type TechNotesData = {
//   diagnosis: string;
//   solution?: string;
//   nextCheckDate?: string;
//   notes?: string;
//   status: 'pendiente' | 'en_proceso' | 'resuelto' | 'requiere_seguimiento';
//   claimDetails?: {
//     description: string;
//     severity: 'baja' | 'media' | 'alta' | 'crítica';
//     category: string;
//     resolution?: string;
//     followUpDate?: string;
//   };
// };

// const TECH_COUNTERS = [
//   { id: 5, name: 'Servicio Técnico 1', color: 'amber' },
//   { id: 6, name: 'Servicio Técnico 2', color: 'amber' }
// ];

// export default function TechServiceView() {
//   const { tickets, fetchTickets, updateTicket, loading, deleteTicket } = useTicketStore();
//   const [counterNumber, setCounterNumber] = useState(5);
//   const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [notesDialogOpen, setNotesDialogOpen] = useState(false);
//   const timeInfo = useTimeInfo(tickets);

//   useEffect(() => {
//     fetchTickets();
//     const interval = setInterval(fetchTickets, 30000);
//     return () => clearInterval(interval);
//   }, [fetchTickets]);

//   useEffect(() => {
//     console.log('Todos los tickets:', tickets);
//   }, [tickets]);

//   const { waitingTickets, currentTicket, completedTickets } = React.useMemo(() => {
//     // Prefijos de tickets técnicos y reclamos
//     const techPrefixes = ['ST', 'PC', 'RE', 'RC']; // ST: Soporte Técnico, PC: Problemas Conexión, RE: Reparación, RC: Reclamo

//     // Filtrar tickets pendientes
//     const waiting = tickets.filter(t => {
//       const isWaiting = t.status === "waiting";
//       const prefix = t.number?.slice(0, 2);
//       const isValidType = prefix && techPrefixes.includes(prefix);
//       const isAssignable = !t.counter || t.counter === counterNumber;

//       console.log('Evaluando ticket:', {
//         id: t.id,
//         number: t.number,
//         prefix,
//         status: t.status,
//         isWaiting,
//         isValidType,
//         isAssignable,
//         shouldInclude: isWaiting && isValidType && isAssignable
//       });

//       return isWaiting && isValidType && isAssignable;
//     });

//     // Buscar ticket actual
//     const current = tickets.find(t => {
//       const isServing = t.status === "serving";
//       const isThisCounter = t.counter === counterNumber;
//       const prefix = t.number?.slice(0, 2);
//       const isValidType = prefix && techPrefixes.includes(prefix);

//       return isServing && isThisCounter && isValidType;
//     });

//     // Filtrar completados
//     const completed = tickets.filter(t => {
//       const isCompleted = t.status === "completed";
//       const isThisCounter = t.counter === counterNumber;
//       const prefix = t.number?.slice(0, 2);
//       const isValidType = prefix && techPrefixes.includes(prefix);
//       const isToday = new Date(t.created_at).toDateString() === new Date().toDateString();

//       return isCompleted && isThisCounter && isValidType && isToday;
//     });

//     // Log del resultado final
//     console.log('Resultado del filtrado:', {
//       total: tickets.length,
//       waiting: {
//         total: waiting.length,
//         tickets: waiting.map(t => ({
//           id: t.id,
//           number: t.number,
//           prefix: t.number?.slice(0, 2),
//           status: t.status,
//           counter: t.counter
//         }))
//       },
//       current: current ? {
//         id: current.id,
//         number: current.number,
//         prefix: current.number?.slice(0, 2)
//       } : null,
//       completed: completed.length
//     });

//     return {
//       waitingTickets: waiting,
//       currentTicket: current,
//       completedTickets: completed
//     };
//   }, [tickets, counterNumber]);

//   useEffect(() => {
//     console.log('Tickets actuales:', {
//       total: tickets.length,
//       waiting: waitingTickets.length,
//       current: currentTicket ? 1 : 0,
//       completed: completedTickets.length
//     });
//   }, [tickets, waitingTickets, currentTicket, completedTickets]);

//   const callTicket = useCallback(async (ticket: Ticket) => {
//     try {
//       // Primero intentar con la síntesis de voz
//       const speech = new SpeechSynthesisUtterance(
//         `Ticket número ${ticket.number}, por favor acercarse a ${
//           counterNumber >= 5 ? `Servicio Técnico ${counterNumber - 4}` : `Caja ${counterNumber}`
//         }`
//       );
//       window.speechSynthesis.speak(speech);

//       // Luego intentar reproducir el sonido
//       try {
//         const audio = new Audio('/call-sound.mp3');
//         await audio.play().catch(err => {
//           console.warn('No se pudo reproducir el sonido:', err);
//           // No lanzar error aquí, continuar con la notificación
//         });
//       } catch (audioError) {
//         console.warn('Error con el audio:', audioError);
//         // No lanzar error aquí tampoco
//       }

//       toast({
//         title: "Llamando ticket",
//         description: `Llamando al ticket ${ticket.number}`,
//       });
//     } catch (error) {
//       console.error('Error al llamar ticket:', error);
//       // Aún mostrar la notificación aunque falle el audio
//       toast({
//         title: "Ticket llamado",
//         description: `Ticket ${ticket.number} llamado (sin audio)`,
//       });
//     }
//   }, [counterNumber]);

//   const handleUpdateTicket = async (ticketId: number, newStatus: 'serving' | 'completed', techData?: any) => {
//     try {
//         if (newStatus === 'serving') {
//             const ticket = tickets.find(t => t.id === ticketId);
//             if (ticket) {
//                 await callTicket(ticket);
//             }
//         }

//         try {
//             // Asegúrate de que techData contenga technical_notes
//             await updateTicket(ticketId, newStatus, counterNumber, techData?.technical_notes); 
            
//             toast({
//                 title: "Ticket actualizado",
//                 description: `El ticket ha sido ${newStatus === 'completed' ? 'completado' : 'actualizado'}`,
//             });
            
//             setSelectedTicket(null);
//             setDialogOpen(false);
//         } catch (updateError) {
//             // Manejo específico de errores de actualización
//             toast({
//                 title: "Error de actualización",
//                 description: updateError instanceof Error 
//                     ? updateError.message 
//                     : "No se pudo actualizar el ticket",
//                 variant: "destructive",
//             });
//         }
//     } catch (error) {
//         toast({
//             title: "Error",
//             description: "Ocurrió un problema al procesar el ticket",
//             variant: "destructive",
//         });
//     }
// };

//   const handleNotesSubmit = async (data: TechNotesData) => {
//     try {
//       const updatedTicket = {
//         ...selectedTicket!,
//         technical_notes: data
//       };
//       await updateTicket(selectedTicket!.id, selectedTicket!.status, counterNumber);
//       toast({
//         title: "Notas guardadas",
//         description: "Las notas técnicas han sido guardadas exitosamente",
//       });
//       setNotesDialogOpen(false);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "No se pudieron guardar las notas",
//         variant: "destructive",
//       });
//     }
//   };
  

//   const callNextTicket = useCallback(async () => {
//     if (currentTicket || !waitingTickets.length) {
//       console.log('No se puede llamar siguiente:', {
//         hasCurrentTicket: !!currentTicket,
//         waitingCount: waitingTickets.length
//       });
//       return;
//     }
    
//     const nextTicket = waitingTickets[0];
//     console.log('Llamando siguiente ticket:', nextTicket);
    
//     try {
//       await handleUpdateTicket(nextTicket.id, "serving");
//     } catch (error) {
//       console.error('Error al llamar siguiente ticket:', error);
//       toast({
//         title: "Error",
//         description: "No se pudo llamar al siguiente ticket",
//         variant: "destructive",
//       });
//     }
//   }, [waitingTickets, currentTicket, handleUpdateTicket]);

//   const handleDeleteTicket = async (ticketId: number) => {
//     try {
//       await deleteTicket(ticketId);
//       toast({
//         title: "Ticket eliminado",
//         description: "El ticket ha sido eliminado exitosamente",
//       });
//       setDialogOpen(false);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "No se pudo eliminar el ticket",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleRecallTicket = async (ticket: Ticket) => {
//     try {
//       await callTicket(ticket);
//       toast({
//         title: "Ticket rellamado",
//         description: `Rellamando al ticket ${ticket.number}`,
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "No se pudo rellamar al ticket",
//         variant: "destructive",
//       });
//     }
//   };

//   const renderTicketInfo = (ticket: Ticket) => {
//     const waitTime = timeInfo.calculateWaitTime(ticket);
//     const isLongWait = waitTime > 30; // más de 30 minutos esperando

//     return (
//       <div className="flex items-center gap-2">
//         {ticket.status === "waiting" && (
//           <Badge 
//             variant="outline" 
//             className={`${isLongWait ? 'bg-red-50 text-red-700' : 'text-gray-600'}`}
//           >
//             <Clock className="h-3 w-3 mr-1" />
//             Espera: {timeInfo.getTimeString(waitTime)}
//           </Badge>
//         )}
//         <Badge variant="outline" className="text-gray-600">
//           <Timer className="h-3 w-3 mr-1" />
//           Estimado: {timeInfo.getTimeString(ticket.estimated_time)}
//         </Badge>
//       </div>
//     );
//   };

//   const renderTicketActions = (ticket: Ticket) => (
//     <div className="flex items-center gap-2">
//       {renderTicketInfo(ticket)}
//       {ticket.status === "waiting" && (
//         <>
//           <Button
//             onClick={() => handleUpdateTicket(ticket.id, "serving")}
//             disabled={!!currentTicket || loading}
//             size="sm"
//             className="bg-amber-500 hover:bg-amber-600"
//           >
//             <ChevronRight className="h-4 w-4 mr-1" />
//             Atender
//           </Button>
//           <Button
//             onClick={() => callTicket(ticket)}
//             variant="outline"
//             size="sm"
//             className="border-amber-200 hover:bg-amber-50"
//           >
//             <Volume2 className="h-4 w-4 mr-1" />
//             Llamar
//           </Button>
//         </>
//       )}
//       {ticket.status === "serving" && (
//         <>
//           <Button
//             onClick={() => handleUpdateTicket(ticket.id, "completed")}
//             size="sm"
//             className="bg-green-500 hover:bg-green-600"
//           >
//             <CheckCircle className="h-4 w-4" />
//           </Button>
//           <Button
//             onClick={() => {
//               setSelectedTicket(ticket);
//               setNotesDialogOpen(true);
//             }}
//             variant="outline"
//             size="sm"
//             className="border-amber-200 hover:bg-amber-50"
//           >
//             <NotebookPen className="h-4 w-4 mr-1" />
//             Notas
//           </Button>
//           <Button
//             onClick={() => handleRecallTicket(ticket)}
//             variant="outline"
//             size="sm"
//             className="border-amber-200 hover:bg-amber-50"
//           >
//             <Volume2 className="h-4 w-4 mr-1" />
//             Rellamar
//           </Button>
//         </>
//       )}
//     </div>
//   );

//   const renderTechTicket = (ticket: Ticket) => (
//     <Card key={ticket.id} className={`border-l-4 ${
//       ticket.status === 'serving' ? 'border-l-green-500 bg-green-50' :
//       ticket.status === 'waiting' && ticket.category_type === 'complaint' ? 'border-l-red-500' :
//       ticket.status === 'waiting' ? 'border-l-amber-500' :
//       'border-l-gray-500'
//     }`}>
//       <CardContent className="p-4">
//         <div className="flex justify-between items-start">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <span className="text-2xl font-bold">{ticket.number}</span>
//               <Badge variant="outline" className={
//                 ticket.category_type === 'complaint' ? 'bg-red-100 text-red-800' :
//                 'bg-amber-100 text-amber-800'
//               }>
//                 {ticket.category_name}
//               </Badge>
//               {ticket.technical_notes?.status && (
//                 <Badge variant="outline" className={
//                   ticket.technical_notes.status === 'resuelto' ? 'bg-green-100 text-green-800' :
//                   ticket.technical_notes.status === 'requiere_seguimiento' ? 'bg-amber-100 text-amber-800' :
//                   'bg-blue-100 text-blue-800'
//                 }>
//                   {ticket.technical_notes.status}
//                 </Badge>
//               )}
//             </div>
//             <div className="flex flex-col gap-1">
//               <div className="flex items-center gap-2">
//                 <User className="w-4 h-4" />
//                 <span className="text-sm">{ticket.customer_name}</span>
//               </div>
//               {ticket.contact_info && (
//                 <div className="flex items-center gap-2">
//                   <Phone className="w-4 h-4" />
//                   <span className="text-sm">{ticket.contact_info}</span>
//                 </div>
//               )}
//               {ticket.additional_notes && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   {ticket.additional_notes}
//                 </p>
//               )}
//               {ticket.technical_notes?.diagnosis && (
//                 <div className="mt-2 p-2 bg-gray-50 rounded-md">
//                   <p className="text-sm font-medium text-gray-700">Diagnóstico:</p>
//                   <p className="text-sm text-gray-600">{ticket.technical_notes.diagnosis}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//           {ticket.category_type === 'complaint' ? (
//             <div className="flex items-center gap-2">
//               <Button
//                 onClick={() => {
//                   setSelectedTicket(ticket);
//                   setNotesDialogOpen(true);
//                 }}
//                 variant="outline"
//                 size="sm"
//                 className="border-red-200 hover:bg-red-50"
//               >
//                 <NotebookPen className="h-4 w-4 mr-1" />
//                 Ver Reclamo
//               </Button>
//             </div>
//           ) : (
//             renderTicketActions(ticket)
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <div className="container max-w-7xl mx-auto p-4">
//       <div className="flex flex-col lg:flex-row gap-6">
//         <div className="lg:w-2/3 space-y-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Select
//                 value={counterNumber.toString()}
//                 onValueChange={(value) => setCounterNumber(Number(value))}
//               >
//                 <SelectTrigger className="w-[200px] bg-amber-100 text-amber-800">
//                   <SelectValue placeholder="Seleccionar técnico" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {TECH_COUNTERS.map((counter) => (
//                     <SelectItem key={counter.id} value={counter.id.toString()}>
//                       {counter.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <h1 className="text-2xl font-bold">Panel de Servicio Técnico</h1>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 onClick={callNextTicket}
//                 disabled={!!currentTicket || !waitingTickets.length || loading}
//                 variant="outline"
//                 className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
//               >
//                 <SkipForward className="h-4 w-4 mr-2" />
//                 Llamar Siguiente ({waitingTickets.length})
//               </Button>
//               {loading && (
//                 <Badge variant="outline" className="animate-pulse">
//                   Actualizando...
//                 </Badge>
//               )}
//             </div>
//           </div>

//           {/* Current Ticket */}
//           <Card className="border-2 border-amber-200 bg-amber-50">
//             <CardHeader>
//               <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
//                 <Laptop className="h-5 w-5" />
//                 Caso en Atención
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {currentTicket ? (
//                 renderTechTicket(currentTicket)
//               ) : (
//                 <div className="text-center py-8 text-gray-500">
//                   <Wrench className="h-8 w-8 mx-auto mb-2" />
//                   <p>No hay casos en atención</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Waiting Tickets */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <AlertTriangle className="h-5 w-5 text-amber-600" />
//                 Casos Pendientes ({waitingTickets.length})
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Mostrar primero los reclamos */}
//               {waitingTickets
//                 .filter(t => t.category_type === 'complaint')
//                 .map(ticket => (
//                   <React.Fragment key={ticket.id}>
//                     {renderTechTicket(ticket)}
//                   </React.Fragment>
//                 ))}
              
//               {/* Luego mostrar los tickets técnicos */}
//               {waitingTickets
//                 .filter(t => t.category_type !== 'complaint')
//                 .map(ticket => (
//                   <React.Fragment key={ticket.id}>
//                     {renderTechTicket(ticket)}
//                   </React.Fragment>
//                 ))}

//               {waitingTickets.length === 0 && (
//                 <div className="text-center py-4 text-gray-500">
//                   No hay casos pendientes
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Completed Today */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//                 Casos Completados Hoy ({completedTickets.length})
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {completedTickets.map(renderTechTicket)}
//               {completedTickets.length === 0 && (
//                 <div className="text-center py-4 text-gray-500">
//                   No hay casos completados hoy
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
        
//         {/* Panel lateral */}
//         <div className="lg:w-1/3">
//           <Card className="sticky top-4">
//             <CardHeader>
//               <CardTitle>Chat Interno</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <InternalChat currentModule={`Técnico ${counterNumber}`} />
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Diálogos */}
//       {selectedTicket && (
//         <>
//           <TechServiceDialog
//        ticket={selectedTicket}
//        isOpen={dialogOpen}
//        onOpenChange={setDialogOpen}
//        onSubmit={(data) => handleUpdateTicket(selectedTicket.id, "serving", data)} // Asegúrate de que data contenga technical_notes
//        onDelete={() => handleDeleteTicket(selectedTicket.id)}
//        onRecall={() => handleRecallTicket(selectedTicket)}
//    />
//           <TechServiceNotes
//             ticket={selectedTicket}
//             isOpen={notesDialogOpen}
//             onOpenChange={setNotesDialogOpen}
//             onSubmit={handleNotesSubmit}
//           />
//         </>
//       )}
//     </div>
//   );
// } 