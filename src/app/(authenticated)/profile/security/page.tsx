"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, KeyRound, ShieldCheck, Eye, EyeOff, Smartphone, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória."),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirmação de senha deve ter pelo menos 6 caracteres."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], // path of error
});

type PasswordChangeFormInputs = z.infer<typeof passwordChangeSchema>;

export default function SecurityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false); // Mock state

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PasswordChangeFormInputs>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onPasswordChangeSubmit: SubmitHandler<PasswordChangeFormInputs> = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success or failure
    if (data.currentPassword === "oldpassword") { // Example: check against a mock old password
      toast({
        title: "Senha Alterada",
        description: "Sua senha foi atualizada com sucesso.",
        variant: "default",
        className:"bg-accent text-accent-foreground"
      });
      reset(); // Reset form fields
    } else {
      toast({
        title: "Erro ao Alterar Senha",
        description: "A senha atual está incorreta.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTwoFactor = () => {
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
    toast({
        title: `Autenticação de Dois Fatores ${isTwoFactorEnabled ? 'Desativada' : 'Ativada'}`,
        description: "Sua preferência de segurança foi atualizada.",
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Login e Segurança</h1>
      </div>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary"/> Alterar Senha</CardTitle>
          <CardDescription>Escolha uma senha forte que você não usa em outro lugar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} {...register("currentPassword")} placeholder="Sua senha atual" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="newPassword">Nova Senha</Label>
               <div className="relative">
                <Input id="newPassword" type={showNewPassword ? "text" : "password"} {...register("newPassword")} placeholder="Mínimo 6 caracteres" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} placeholder="Repita a nova senha" />
                 <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Salvando..." : "Salvar Nova Senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Smartphone className="mr-2 h-5 w-5 text-primary"/> Autenticação de Dois Fatores (2FA)</CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className={`p-3 rounded-lg flex items-center justify-between ${isTwoFactorEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-secondary/30'}`}>
                <div>
                    <p className={`font-medium ${isTwoFactorEnabled ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                        Status: {isTwoFactorEnabled ? "Ativado" : "Desativado"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {isTwoFactorEnabled 
                            ? "Sua conta está protegida com 2FA." 
                            : "Ative para aumentar a segurança da sua conta."
                        }
                    </p>
                </div>
                <Button 
                    onClick={handleToggleTwoFactor} 
                    variant={isTwoFactorEnabled ? "outline" : "default"}
                    className={isTwoFactorEnabled ? "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-800/50" : "bg-primary hover:bg-primary/90"}
                >
                    {isTwoFactorEnabled ? "Desativar 2FA" : "Ativar 2FA"}
                </Button>
            </div>
            {isTwoFactorEnabled && (
                 <p className="mt-3 text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
                    <AlertTriangle className="inline mr-1.5 h-4 w-4 text-blue-500" />
                    Em uma aplicação real, aqui você configuraria seu método 2FA (App Autenticador, SMS, etc.).
                </p>
            )}
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/> Dispositivos Conectados</CardTitle>
          <CardDescription>Gerencie os dispositivos que têm acesso à sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mocked list of devices */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Navegador Chrome - Desktop</p>
                <p className="text-xs text-muted-foreground">São Paulo, Brasil - Sessão atual</p>
              </div>
              <Button variant="link" className="text-xs text-destructive p-0 h-auto">Desconectar</Button>
            </div>
            <Separator/>
            <div className="flex justify-between items-center p-3 rounded-lg">
              <div>
                <p className="font-medium text-foreground">App WeStudy - iPhone 15</p>
                <p className="text-xs text-muted-foreground">Rio de Janeiro, Brasil - 2 dias atrás</p>
              </div>
              <Button variant="link" className="text-xs text-destructive p-0 h-auto">Desconectar</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4">
            <Button variant="outline" className="w-full">Desconectar de todos os outros dispositivos</Button>
        </CardFooter>
      </Card>

    </div>
  );
}
