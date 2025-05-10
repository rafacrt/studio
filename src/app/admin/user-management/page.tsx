
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data - substitua por dados reais
const mockUsers = [
  { id: "user001", name: "Ana Beatriz Costa", email: "ana.costa@email.com", avatarUrl: "https://picsum.photos/seed/user001/40/40", role: "Usuário", status: "Ativo", dateJoined: "2023-05-15" },
  { id: "user002", name: "Bruno Lima Silva", email: "bruno.lima@email.com", avatarUrl: "https://picsum.photos/seed/user002/40/40", role: "Anfitrião", status: "Ativo", dateJoined: "2023-03-20" },
  { id: "user003", name: "Carlos Eduardo Reis", email: "carlos.reis@email.com", avatarUrl: "https://picsum.photos/seed/user003/40/40", role: "Usuário", status: "Inativo", dateJoined: "2024-01-10" },
  { id: "admin1", name: "Admin WeStudy", email: "admin@westudy.com", avatarUrl: "https://picsum.photos/seed/admin1/40/40", role: "Admin", status: "Ativo", dateJoined: "2022-01-01" },
];


export default function UserManagementPage() {
  // TODO: Lógica para editar, excluir, buscar usuários
  const handleEditUser = (userId: string) => {
    console.log(`Editar usuário: ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    console.log(`Excluir usuário: ${userId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie os usuários da plataforma.</CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuários por nome ou e-mail..."
                className="w-full max-w-sm rounded-md bg-background pl-10 pr-4 py-2 h-10 text-sm"
                // value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mockUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar"/>
                          <AvatarFallback>{user.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "Admin" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Ativo" ? "secondary" : "destructive"} 
                             className={user.status === "Ativo" ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700" 
                                                                 : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.dateJoined).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user.id)} title="Editar">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-muted-foreground text-center py-8">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
