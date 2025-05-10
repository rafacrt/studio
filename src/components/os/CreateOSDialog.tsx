'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { useOSStore } from '@/store/os-store';
import { OSStatus, ALL_OS_STATUSES, type CreateOSData } from '@/lib/types';

const formSchema = z.object({
  cliente: z.string().min(1, { message: 'Nome do cliente é obrigatório.' }),
  parceiro: z.string().optional(),
  projeto: z.string().min(1, { message: 'Nome do projeto é obrigatório.' }),
  tarefa: z.string().min(1, { message: 'A descrição da tarefa é obrigatória.' }),
  observacoes: z.string().optional(),
  tempoTrabalhado: z.string().optional(),
  status: z.nativeEnum(OSStatus, { errorMap: () => ({ message: "Por favor, selecione um status." }) }).default(OSStatus.NA_FILA),
  isUrgent: z.boolean().default(false),
});

type CreateOSFormValues = z.infer<typeof formSchema>;

export function CreateOSDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const addOS = useOSStore((state) => state.addOS);

  const form = useForm<CreateOSFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      parceiro: '',
      projeto: '',
      tarefa: '',
      observacoes: '',
      tempoTrabalhado: '',
      status: OSStatus.NA_FILA,
      isUrgent: false,
    },
  });

  async function onSubmit(values: CreateOSFormValues) {
    setIsSubmitting(true);
    try {
      // Ensure optional fields that are empty are passed as undefined or empty string as appropriate
      const dataToSubmit: CreateOSData = {
        ...values,
        parceiro: values.parceiro || undefined,
        observacoes: values.observacoes || '',
        tempoTrabalhado: values.tempoTrabalhado || '',
      };
      addOS(dataToSubmit);
      toast({
        title: 'OS Criada',
        description: `Ordem de Serviço para ${values.cliente} - ${values.projeto} foi criada com sucesso.`,
      });
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar OS. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova OS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar uma nova OS. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Empresa Acme" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="parceiro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parceiro (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Agência XYZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desenvolvimento de Website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tarefa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarefa Principal *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a tarefa principal a ser realizada..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionais, detalhes importantes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tempoTrabalhado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Trabalhado (inicial)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2h reunião, 4h desenvolvimento" {...field} />
                  </FormControl>
                   <p className="text-sm text-muted-foreground">
                      Registre o tempo já dedicado ou sessões de trabalho.
                    </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status inicial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_OS_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Marcar como Urgente
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Tarefas urgentes serão destacadas.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar OS
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
