"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Bell, MessageSquare, Tag, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Mock notification settings states
  const [emailNotifications, setEmailNotifications] = useState({
    newBookings: true,
    bookingUpdates: true,
    promotions: false,
    platformUpdates: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    newBookings: true,
    messages: true,
    reminders: true,
  });

  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePushToggle = (key: keyof typeof pushNotifications) => {
    setPushNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = () => {
    // Simulate saving notification preferences
    console.log("Email Preferences:", emailNotifications);
    console.log("Push Preferences:", pushNotifications);
    toast({
      title: "Preferências Salvas",
      description: "Suas configurações de notificação foram atualizadas.",
      variant: "default",
      className: "bg-accent text-accent-foreground"
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
      </div>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Notificações por E-mail</CardTitle>
          <CardDescription>Escolha quais e-mails você deseja receber.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <NotificationItem 
            id="email-new-bookings"
            label="Novas Reservas e Solicitações"
            icon={Tag}
            checked={emailNotifications.newBookings}
            onCheckedChange={() => handleEmailToggle('newBookings')}
          />
          <Separator/>
          <NotificationItem 
            id="email-booking-updates"
            label="Atualizações de Reservas"
            icon={Settings2}
            checked={emailNotifications.bookingUpdates}
            onCheckedChange={() => handleEmailToggle('bookingUpdates')}
          />
          <Separator/>
          <NotificationItem 
            id="email-promotions"
            label="Promoções e Ofertas Especiais"
            icon={MessageSquare} // Using MessageSquare as a placeholder for offers
            checked={emailNotifications.promotions}
            onCheckedChange={() => handleEmailToggle('promotions')}
          />
          <Separator/>
          <NotificationItem 
            id="email-platform-updates"
            label="Atualizações da Plataforma e Notícias"
            icon={Bell}
            checked={emailNotifications.platformUpdates}
            onCheckedChange={() => handleEmailToggle('platformUpdates')}
          />
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Notificações Push (App)</CardTitle>
          <CardDescription>Gerencie as notificações que aparecem no seu dispositivo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <NotificationItem 
            id="push-new-bookings"
            label="Novas Reservas e Solicitações"
            icon={Tag}
            checked={pushNotifications.newBookings}
            onCheckedChange={() => handlePushToggle('newBookings')}
          />
          <Separator/>
          <NotificationItem 
            id="push-messages"
            label="Novas Mensagens"
            icon={MessageSquare}
            checked={pushNotifications.messages}
            onCheckedChange={() => handlePushToggle('messages')}
          />
          <Separator/>
           <NotificationItem 
            id="push-reminders"
            label="Lembretes Importantes"
            icon={Bell}
            checked={pushNotifications.reminders}
            onCheckedChange={() => handlePushToggle('reminders')}
          />
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
         <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar Preferências</Button>
      </div>
    </div>
  );
}

interface NotificationItemProps {
    id: string;
    label: string;
    icon: React.ElementType;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ id, label, icon: Icon, checked, onCheckedChange }) => {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/20 transition-colors">
            <Label htmlFor={id} className="flex items-center text-base cursor-pointer">
                <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
                {label}
            </Label>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-label={label}
            />
        </div>
    );
}
