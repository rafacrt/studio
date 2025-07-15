
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/web/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/web/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/web/components/ui/avatar";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { Edit3, Trash2, Search, Mail } from "lucide-react"; // Added Mail icon
import { Input } from "@/web/components/ui/input";
import { useToast } from "@/web/hooks/use-toast"; // Added useToast
import { useState } from "react"; // Added useState for search
import { mockUser, mockAdminUser } from '@/packages/lib/auth-mocks'; // Ensure mockUsers are correctly sourced or managed

// Combine mock users for the list
const allMockUsers = [mockUser, mockAdminUser,
  { id: "user001", name: "Ana Beatriz Costa", email: "ana.costa@exemplo.com", avatarUrl: "https://picsum.photos/seed/user001/40/40", role: "Usuário", status: "Ativo", dateJoined: "2023-05-15", isAdmin: false },
  { id: "user002", name: "Bruno Lima Silva", email: "bruno.lima@exemplo.com", avatarUrl: "https://picsum.photos/seed/user002/40/40", role: "Usuário", status: "Ativo", dateJoined: "2023-03-20", isAdmin: false },
  { id: "user003", name: "Carlos Eduardo Reis", email: "carlos.reis@exemplo.com", avatarUrl: "https://picsum.photos/seed/user003/40/40", role: "Usuário", status: "Inativo", dateJoined: "2024-01-10", isAdmin: false },
];


export default function UserManagementPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditUser = (userId: string) => {
    console.log(`Editar usuário: ${userId}`);
    toast({ title: "Ação de Edição", description: `Editar usuário ${userId} (funcionalidade pendente).` });
  };

  const handleDeleteUser = (userId: string) => {
    console.log(`Excluir usuário: ${userId}`);
    // Mock deletion: filter out user (in a real app, this would be an API call)
    // setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({ title: "Usuário Excluído", description: `Usuário ${userId} foi excluído (simulação).`, variant: "destructive" });
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    console.log(`Redefinir senha para usuário: ${userId} (${userEmail})`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    toast({
      title: "Redefinição de Senha",
      description: `Um link para redefinição de senha foi enviado para ${userEmail}. (Simulação)`,
      variant: "default",
      className: "bg-accent text-accent-foreground"
    });
  };
  
  const filteredUsers = allMockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
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
                {filteredUsers.map((user) => (
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
                      <Badge variant={user.isAdmin ? "default" : "outline"}>
                        {user.isAdmin ? "Admin" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Ativo" ? "secondary" : "destructive"} 
                             className={user.status === "Ativo" ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700" 
                                                                 : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"}>
                        {user.status || "Ativo"} {/* Default to Ativo if status is missing */}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.dateJoined ? new Date(user.dateJoined).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user.id)} title="Editar Usuário">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                       <Button variant="outline" size="icon" onClick={() => handleResetPassword(user.id, user.email)} title="Redefinir Senha">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)} title="Excluir Usuário" disabled={user.isAdmin}> {/* Disable delete for admin for safety */}
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
