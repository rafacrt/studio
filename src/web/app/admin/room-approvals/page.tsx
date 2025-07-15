
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/web/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/web/components/ui/table";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { CheckCircle, XCircle, Eye } from "lucide-react";

// Mock data - substitua por dados reais
const mockPendingRooms = [
  { id: "room123", name: "Quarto Aconchegante Centro", applicant: "João Silva", dateSubmitted: "2024-07-28", status: "Pendente" },
  { id: "room456", name: "Kitnet Mobiliada Perto da USP", applicant: "Maria Oliveira", dateSubmitted: "2024-07-27", status: "Pendente" },
  { id: "room789", name: "Vaga em República Estudantil", applicant: "Carlos Pereira", dateSubmitted: "2024-07-26", status: "Pendente" },
];

export default function RoomApprovalsPage() {
  // TODO: Lógica para aprovar/rejeitar quartos
  const handleApprove = (roomId: string) => {
    console.log(`Aprovar quarto: ${roomId}`);
    // Chamar API, atualizar estado, etc.
  };

  const handleReject = (roomId: string) => {
    console.log(`Rejeitar quarto: ${roomId}`);
    // Chamar API, atualizar estado, etc.
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Aprovações de Quartos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Quartos Pendentes de Aprovação</CardTitle>
          <CardDescription>Revise e aprove ou rejeite os novos anúncios de quartos.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockPendingRooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Quarto</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPendingRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{room.applicant}</TableCell>
                    <TableCell>{new Date(room.dateSubmitted).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={room.status === "Pendente" ? "secondary" : "default"}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="ghost" size="icon" title="Ver Detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleApprove(room.id)} className="text-green-600 hover:text-green-700 border-green-600 hover:bg-green-50" title="Aprovar">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleReject(room.id)} className="text-red-600 hover:text-red-700 border-red-600 hover:bg-red-50" title="Rejeitar">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum quarto pendente de aprovação no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
