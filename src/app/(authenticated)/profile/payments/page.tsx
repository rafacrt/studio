"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, CreditCard, PlusCircle, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data
const paymentMethods = [
  { id: "pm1", type: "Cartão de Crédito", details: "**** **** **** 1234", expiry: "12/25", isDefault: true },
  { id: "pm2", type: "Cartão de Débito", details: "**** **** **** 5678", expiry: "08/26", isDefault: false },
];

const paymentHistory = [
  { id: "ph1", date: "15/07/2024", description: "Aluguel - Quarto Próximo USP", amount: "R$ 950,00", status: "Pago" },
  { id: "ph2", date: "15/06/2024", description: "Aluguel - Quarto Próximo USP", amount: "R$ 950,00", status: "Pago" },
  { id: "ph3", date: "01/06/2024", description: "Taxa de Serviço", amount: "R$ 50,00", status: "Pago" },
];


export default function PaymentsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
      </div>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/> Métodos de Pagamento</CardTitle>
          <CardDescription>Gerencie seus cartões e outras formas de pagamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="p-3 rounded-lg border bg-card flex justify-between items-center hover:shadow-sm transition-shadow">
              <div>
                <p className="font-medium text-foreground">{method.type} {method.isDefault && <span className="text-xs text-accent ml-1">(Padrão)</span>}</p>
                <p className="text-sm text-muted-foreground">{method.details} - Expira em: {method.expiry}</p>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Edit2 size={16}/>
                </Button>
                {!method.isDefault && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16}/>
                    </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Novo Método de Pagamento
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Veja seus pagamentos e recibos anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <ul className="space-y-3">
              {paymentHistory.map(item => (
                <li key={item.id} className="p-3 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground">{item.description}</p>
                    <p className="font-semibold text-foreground">{item.amount}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <p className={`text-xs font-medium ${item.status === 'Pago' ? 'text-green-600' : 'text-red-600'}`}>{item.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhuma transação encontrada.</p>
          )}
        </CardContent>
         <CardFooter className="pt-4">
            <Button variant="link" className="w-full text-primary">Ver todas as transações</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
