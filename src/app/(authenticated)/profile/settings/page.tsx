"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Moon, Sun,Palette, Trash2, Languages, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados para simular configurações
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pt-br");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    // Carregar preferências salvas (ex: de localStorage)
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);

    const savedLang = localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang);
    
    // Simular carregamento de preferências de notificação
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', String(checked));
    document.documentElement.classList.toggle('dark', checked);
    toast({ title: `Modo ${checked ? 'Escuro' : 'Claro'} Ativado`, description: "A interface foi atualizada."});
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('language', value);
    toast({ title: "Idioma Alterado", description: `Idioma definido para ${value === 'pt-br' ? 'Português (Brasil)' : 'Inglês'}.`});
  };
  
  const handleSaveChanges = () => {
    // Simular salvamento de configurações
    toast({
        title: "Configurações Salvas",
        description: "Suas preferências foram atualizadas.",
        variant: "default",
        className: "bg-accent text-accent-foreground"
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Configurações da Conta</h1>
      </div>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/> Aparência</CardTitle>
          <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <Label htmlFor="dark-mode" className="flex items-center text-base">
              {darkMode ? <Moon className="mr-2 h-5 w-5 text-yellow-400" /> : <Sun className="mr-2 h-5 w-5 text-orange-400" />}
              Modo Escuro
            </Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
              aria-label="Ativar modo escuro"
            />
          </div>
          <Separator />
           <div className="flex items-center justify-between p-3 rounded-lg">
            <Label htmlFor="language-select" className="flex items-center text-base">
                <Languages className="mr-2 h-5 w-5 text-primary"/>
                Idioma
            </Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language-select" className="w-[180px] bg-background">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                <SelectItem value="en-us">Inglês (EUA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Notificações</CardTitle>
          <CardDescription>Gerencie como você recebe atualizações.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <Label htmlFor="email-notifications" className="text-base">Notificações por E-mail</Label>
                <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                    aria-label="Ativar notificações por email"
                />
            </div>
            <Separator/>
            <div className="flex items-center justify-between p-3 rounded-lg">
                <Label htmlFor="push-notifications" className="text-base">Notificações Push</Label>
                <Switch 
                    id="push-notifications" 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications}
                    aria-label="Ativar notificações push"
                />
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive"><Trash2 className="mr-2 h-5 w-5"/> Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis. Tenha cuidado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={() => toast({title: "Ação de Exclusão", description: "Funcionalidade de exclusão de conta ainda não implementada.", variant: "destructive"})}>
            Excluir Minha Conta
          </Button>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Ao excluir sua conta, todos os seus dados e reservas serão permanentemente removidos.
          </p>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-end">
         <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar Alterações</Button>
      </div>
    </div>
  );
}
