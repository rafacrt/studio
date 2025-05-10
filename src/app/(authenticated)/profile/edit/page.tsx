"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { triggerHapticFeedback } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  phone: z.string().optional(), // Assuming phone is optional
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { user, login } = useAuth(); // Assuming updateUser function exists in AuthContext
  const { toast } = useToast();
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "" // Populate if phone is stored in user object
    }
  });

  if (!user) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        // Optionally, you can directly upload the image here or store the base64
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    triggerHapticFeedback();
    try {
      // Simulate API call to update user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd update the user object in your backend/AuthContext
      // For this mock, we'll just update the user in AuthContext if possible
      // or show a success message.
      // For demo, let's assume `login` can re-authenticate with updated details.
      // This is a simplification. A proper updateUser would be better.
      if (user.email !== data.email) {
        // If email changed, it might imply re-authentication or a specific update flow
        // For this example, we'll just display a message.
        toast({
          title: "E-mail alterado",
          description: "Para alterar o e-mail, por favor, contate o suporte.",
          variant: "default"
        });
      } else {
         // Re-login with potentially new name/avatar to update context
        const updatedUser = {
          ...user,
          name: data.name,
          avatarUrl: avatarPreview || user.avatarUrl,
        };
        // This is a hack. Ideally, you'd have an `updateUser` in AuthContext.
        localStorage.setItem('weStudyUser', JSON.stringify(updatedUser));
        // Force re-evaluation of AuthContext. This is not ideal.
        await login(updatedUser.email, 'dummyPasswordToTriggerContextUpdate');


        toast({
          title: "Perfil Atualizado",
          description: "Suas informações foram salvas com sucesso.",
          variant: "default",
          className: "bg-accent text-accent-foreground"
        });
      }
      router.push('/profile');
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Informações Pessoais</h1>
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Edite seus dados</CardTitle>
          <CardDescription>Mantenha suas informações pessoais atualizadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-md">
                  <AvatarImage src={avatarPreview || user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
                  <AvatarFallback className="text-4xl">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Label htmlFor="avatarUpload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera size={20} />
                  <input id="avatarUpload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...register("name")} placeholder="Seu nome completo" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Endereço de E-mail</Label>
              <Input id="email" type="email" {...register("email")} placeholder="seuemail@exemplo.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <Input id="phone" type="tel" {...register("phone")} placeholder="(XX) XXXXX-XXXX" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="mr-2" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
