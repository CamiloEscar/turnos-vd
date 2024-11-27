import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageSquare } from 'lucide-react';
import type { Ticket } from "../lib/types";

interface ComplaintDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
}

export function ComplaintDetails({ isOpen, onOpenChange, ticket }: ComplaintDetailsProps) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            Detalles del Reclamo
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Número de Ticket</h3>
              <p className="text-lg font-bold">{ticket.number}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Cliente</h3>
              <p>{ticket.customer_name || 'No especificado'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Categoría</h3>
              <p>{ticket.category_name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Estado</h3>
              <Badge
                variant="outline"
                className={
                  ticket.status === "serving"
                    ? "bg-green-100 text-green-800"
                    : ticket.status === "waiting"
                    ? "bg-yellow-100 text-yellow-800"
                    : ticket.status === "missed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {ticket.status === "waiting" && "En espera"}
                {ticket.status === "serving" && "En atención"}
                {ticket.status === "completed" && "Completado"}
                {ticket.status === "missed" && "Perdido"}
              </Badge>
            </div>
            {ticket.technical_notes?.claimDetails && (
              <>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Descripción del Reclamo</h3>
                  <p>{ticket.technical_notes.claimDetails.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Severidad</h3>
                  <Badge
                    variant="outline"
                    className={
                      ticket.technical_notes.claimDetails.severity === "crítica"
                        ? "bg-red-100 text-red-800"
                        : ticket.technical_notes.claimDetails.severity === "alta"
                        ? "bg-orange-100 text-orange-800"
                        : ticket.technical_notes.claimDetails.severity === "media"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {ticket.technical_notes.claimDetails.severity}
                  </Badge>
                </div>
                {ticket.technical_notes.claimDetails.resolution && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Resolución</h3>
                    <p>{ticket.technical_notes.claimDetails.resolution}</p>
                  </div>
                )}
                {ticket.technical_notes.claimDetails.followUpDate && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500">Fecha de Seguimiento</h3>
                    <p>{new Date(ticket.technical_notes.claimDetails.followUpDate).toLocaleDateString()}</p>
                  </div>
                )}
              </>
            )}
            {ticket.additional_notes && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Notas Adicionales</h3>
                <p>{ticket.additional_notes}</p>
              </div>
            )}
            {ticket.technical_notes?.notes && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Notas Técnicas</h3>
                <p>{ticket.technical_notes.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
