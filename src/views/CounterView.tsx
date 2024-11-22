"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import InternalChat from "@/components/InternalChat";

export default function CounterView() {
  const { tickets, fetchTickets, updateTicket, loading, error } =
    useTicketStore();
  const [counterNumber, setCounterNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("waiting");

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

  const { waitingTickets, currentTicket, completedTickets, missedTickets } =
    useMemo(
      () => ({
        waitingTickets: tickets.filter((t) => t.status === "waiting"),
        currentTicket: tickets.find(
          (t) => t.status === "serving" && t.counter === counterNumber
        ),
        completedTickets: tickets.filter(
          (t) => t.status === "completed" && t.counter === counterNumber
        ),
        missedTickets: tickets.filter(
          (t) => t.status === "missed" && t.counter === counterNumber
        ),
      }),
      [tickets, counterNumber]
    );

  const getTicketAge = useCallback((createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  }, []);

  const getCategoryIcon = useCallback((categoryId: number) => {
    switch (categoryId) {
      case 1:
        return <Users className="h-4 w-4" />;
      case 2:
        return <Clock className="h-4 w-4" />;
      case 3:
        return <Bell className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  }, []);

  const getCategoryColor = useCallback((categoryId: number) => {
    switch (categoryId) {
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-amber-100 text-amber-800";
      case 3:
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const handleUpdateTicket = useCallback(
    async (ticketId: number, newStatus: string) => {
      try {
        await updateTicket(ticketId, newStatus as any, counterNumber);
        toast({
          title: "Ticket actualizado",
          description: `El ticket ha sido marcado como ${newStatus}`,
        });
      } catch (error) {
        console.error("Error updating ticket:", error);
        toast({
          title: "Error",
          description:
            "No se pudo actualizar el ticket. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        });
      }
    },
    [updateTicket, counterNumber]
  );

  const renderTicketCard = useCallback(
    (ticket: any, actions = true) => (
      <Card
        key={`ticket-${ticket.id}-${ticket.status}`}
        className={`transition-all duration-200 border-l-4 ${
          ticket.status === "serving"
            ? "border-l-green-500 bg-green-50"
            : ticket.status === "waiting"
            ? "border-l-blue-500 hover:bg-blue-50"
            : ticket.status === "missed"
            ? "border-l-red-500 hover:bg-red-50"
            : "border-l-gray-500 hover:bg-gray-50"
        }`}
      >
        <CardContent className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div
                className={`rounded-full p-2 ${getCategoryColor(
                  ticket.category_id
                )}`}
              >
                {getCategoryIcon(ticket.category_id)}
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
                <span className="">
                {ticket.category_name || "N/A"}
                </span>
                <Badge
                  variant="outline"
                  className={
                    ticket.status === "serving"
                      ? "text-green-600 bg-green-100"
                      : ticket.status === "waiting"
                      ? "text-blue-600 bg-blue-100"
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
                <Badge variant="outline" className="text-gray-600">
                  <Timer className="h-3 w-3 mr-1" />{" "}
                  {getTicketAge(ticket.created_at)} min
                </Badge>
              </div>
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {ticket.status === "waiting" && (
                <Button
                  onClick={() => handleUpdateTicket(ticket.id, "serving")}
                  disabled={!!currentTicket || loading}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Llamar
                </Button>
              )}
              {ticket.status === "serving" && (
                <>
                  <Button
                    onClick={() => handleUpdateTicket(ticket.id, "completed")}
                    disabled={loading}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleUpdateTicket(ticket.id, "missed")}
                    disabled={loading}
                    size="sm"
                    variant="destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              {ticket.status === "missed" && (
                <Button
                  onClick={() => handleUpdateTicket(ticket.id, "waiting")}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ),
    [
      getCategoryColor,
      getCategoryIcon,
      getTicketAge,
      handleUpdateTicket,
      currentTicket,
      loading,
    ]
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Seleccionar módulo" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={`counter-${num}`} value={num.toString()}>
                      Módulo {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <h1 className="text-2xl font-bold">Panel de Atención</h1>
            </div>
            {loading && (
              <Badge variant="outline" className="animate-pulse">
                Actualizando...
              </Badge>
            )}
          </div>

          {/* Current Ticket Section */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-800">
                Turno Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTicket ? (
                renderTicketCard(currentTicket)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay turno en atención</p>
                  <p className="text-sm">
                    Seleccione "Llamar" en un turno pendiente para comenzar
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
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
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
                    value="recent"
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
                      <p>No hay turnos en espera</p>
                    </div>
                  ) : (
                    waitingTickets.map((ticket, index) => (
                      <React.Fragment key={`waiting-${ticket.id}-${index}`}>
                        {renderTicketCard(ticket)}
                      </React.Fragment>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="missed" className="space-y-2">
                  {missedTickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Archive className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay turnos perdidos</p>
                    </div>
                  ) : (
                    missedTickets.map((ticket, index) => (
                      <React.Fragment key={`missed-${ticket.id}-${index}`}>
                        {renderTicketCard(ticket)}
                      </React.Fragment>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="recent" className="space-y-2">
                  {completedTickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay turnos completados</p>
                    </div>
                  ) : (
                    completedTickets.map((ticket, index) => (
                      <React.Fragment key={`completed-${ticket.id}-${index}`}>
                        {renderTicketCard(ticket, false)}
                      </React.Fragment>
                    ))
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
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      En Espera
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {waitingTickets.length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-blue-600" />
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      Turnos Completados
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
                      Turnos Perdidos
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
                                sum + getTicketAge(ticket.created_at),
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
          <InternalChat currentModule={`Módulo ${counterNumber}`} />
          </Card>
        </div>
      </div>
    </div>
  );
}
