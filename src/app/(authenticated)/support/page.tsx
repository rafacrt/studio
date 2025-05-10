"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, HelpCircle, Search, MessageSquare, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

const faqItems = [
  {
    question: "Como funciona o processo de aluguel de um quarto?",
    answer: "Para alugar um quarto, navegue pela seção 'Explorar', encontre um quarto que goste, verifique os detalhes e clique em 'Alugar Quarto'. Você precisará estar logado. O processo é simplificado para universitários.",
  },
  {
    question: "Quais são os métodos de pagamento aceitos?",
    answer: "Aceitamos cartões de crédito (Visa, MasterCard, Amex) e débito. Você pode gerenciar seus métodos de pagamento na seção 'Perfil > Pagamentos'.",
  },
  {
    question: "Como entro em contato com o suporte?",
    answer: "Você pode nos contatar através do formulário nesta página, pelo chat online (clicando no ícone de chat) ou pelo telefone listado na seção 'Fale Conosco'.",
  },
  {
    question: "Posso cancelar uma reserva?",
    answer: "Sim, a política de cancelamento varia de acordo com o anúncio. Verifique os termos específicos no momento da reserva. Geralmente, cancelamentos com antecedência são mais flexíveis.",
  },
   {
    question: "Como funciona o acesso ao quarto alugado?",
    answer: "Após a confirmação do aluguel, você poderá acessar o quarto digitalmente através do nosso aplicativo. Na seção 'Minhas Reservas', para reservas ativas, haverá um botão 'Acessar Quarto' que simula o destrancamento da porta.",
  },
];

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-3xl">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
          <HelpCircle className="mr-3 h-7 w-7 text-primary" /> Central de Ajuda
        </h1>
      </div>

      <Card className="mb-8 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Como podemos ajudar?</CardTitle>
          <CardDescription>Procure por tópicos ou navegue pelas perguntas frequentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Digite sua dúvida aqui..."
              className="w-full rounded-lg bg-secondary pl-10 pr-4 py-2 h-11 text-base focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8 shadow-lg rounded-xl">
        <CardHeader>
            <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-b border-border last:border-b-0">
                    <AccordionTrigger className="text-base font-medium text-left hover:no-underline py-4 px-2">
                    {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4 px-2">
                    {item.answer}
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Fale Conosco</CardTitle>
          <CardDescription>Não encontrou o que precisava? Entre em contato.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full py-6 text-base">
              <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Chat Online
            </Button>
            <Button variant="outline" className="w-full py-6 text-base">
              <Phone className="mr-2 h-5 w-5 text-primary"/> Ligar para Suporte
            </Button>
          </div>
           <div>
            <p className="text-sm text-muted-foreground mb-2 text-center">Ou envie-nos uma mensagem:</p>
            <form className="space-y-4">
                <div>
                    <Input type="email" placeholder="Seu endereço de e-mail" className="bg-secondary"/>
                </div>
                <div>
                    <Textarea placeholder="Descreva seu problema ou dúvida..." rows={5} className="bg-secondary"/>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Enviar Mensagem</Button>
            </form>
           </div>
        </CardContent>
      </Card>
      
       <p className="mt-8 text-center text-xs text-muted-foreground">
        Horário de atendimento do suporte: Segunda a Sexta, das 9h às 18h.
      </p>
    </div>
  );
}
