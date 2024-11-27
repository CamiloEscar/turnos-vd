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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Ticket } from "@/lib/types";

const techFormSchema = z.object({
  problemDescription: z.string().min(10, "Descripción debe tener al menos 10 caracteres"),
  solution: z.string().optional(),
  estimatedTime: z.string().optional(),
});

type TechFormData = z.infer<typeof techFormSchema>;

interface TechServiceDialogProps {
  ticket: Ticket;
  onSubmit: (data: TechFormData) => void;
  onDelete?: () => void;
  onRecall?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TechServiceDialog({
  ticket,
  onSubmit,
  onDelete,
  onRecall,
  isOpen,
  onOpenChange
}: TechServiceDialogProps) {
  const form = useForm<TechFormData>({
    resolver: zodResolver(techFormSchema),
    defaultValues: {
      problemDescription: ticket.additional_notes || "",
      solution: "",
      estimatedTime: ticket.estimated_time?.toString() || "",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ticket {ticket.number}</span>
            <div className="flex gap-2">
              {onRecall && (
                <Button
                  onClick={onRecall}
                  variant="outline"
                  size="sm"
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  Rellamar
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Problema</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-24" />
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
                    <Textarea {...field} className="h-24" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo Estimado (min)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
