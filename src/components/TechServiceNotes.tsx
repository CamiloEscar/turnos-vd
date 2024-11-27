import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import * as z from "zod";
import type { Ticket } from "@/lib/types";

const techNotesSchema = z.object({
  diagnosis: z.string().min(1, "Diagnóstico es requerido"),
  solution: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pendiente', 'en_proceso', 'resuelto', 'requiere_seguimiento']),
});

type TechNotesData = z.infer<typeof techNotesSchema>;

interface TechServiceNotesProps {
  ticket: Ticket;
  onSubmit: (data: TechNotesData) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TechServiceNotes({
  ticket,
  onSubmit,
  isOpen,
  onOpenChange
}: TechServiceNotesProps) {
  const form = useForm<TechNotesData>({
    resolver: zodResolver(techNotesSchema),
    defaultValues: {
      diagnosis: ticket.technical_notes?.diagnosis || "",
      solution: ticket.technical_notes?.solution || "",
      notes: ticket.technical_notes?.notes || "",
      status: ticket.technical_notes?.status || "pendiente",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Ticket {ticket.number}</span>
              <Badge variant="outline" className="text-sm">
                {ticket.category_name}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-20 resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solución</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-20 resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-20 resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="requiere_seguimiento">Requiere Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 