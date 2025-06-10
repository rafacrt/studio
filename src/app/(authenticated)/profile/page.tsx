
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, HelpCircle, LogOut, ChevronRight, ShieldCheck, Briefcase, Award, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // O AuthContext já redireciona para /login?message=...
  };

  const handleNavigate = (section: string, path?: string) => {
    if (path) {
      router.push(path);
    } else {
      toast({
        title: "Navegação",
        description: `Seção "${section}" em desenvolvimento.`,
      });
    }
  };

  const getMembershipDuration = () => {
    if (user?.dateJoined) {
      try {
        return formatDistanceToNow(parseISO(user.dateJoined), { addSuffix: true, locale: ptBR });
      } catch (e) {
        return "algum tempo"; // Fallback
      }
    }
    return "algum tempo";
  };

  const userLocation = "Campinas, Brasil"; // Mocked location as in screenshot
  const userTotalBookings = 1; // Mocked stat
  const userReviewsCount = 1; // Mocked stat

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 max-w-3xl">
        <header className="mb-8 pt-4">
          <h1 className="text-4xl font-bold text-foreground">
            Perfil
          </h1>
        </header>

        <Card className="shadow-lg rounded-2xl mb-8 overflow-hidden">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-background">
                <AvatarImage src={user?.avatarUrl} alt={user?.name || "Usuário"} data-ai-hint="user avatar large" />
                <AvatarFallback className="text-2xl bg-muted">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white rounded-full p-1 border-2 border-card">
                <ShieldCheck size={14} strokeWidth={3}/>
              </div>
            </div>
            
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-foreground">{user?.name || "Nome do Usuário"}</h2>
              <p className="text-sm text-muted-foreground">{userLocation}</p>
            </div>

            <Separator orientation="vertical" className="h-16 self-center mx-2" />

            <div className="space-y-2 text-sm text-right flex-shrink-0 w-28">
              <div>
                <p className="font-semibold text-foreground">{userTotalBookings}</p>
                <p className="text-xs text-muted-foreground">reserva</p>
              </div>
              <Separator/>
              <div>
                <p className="font-semibold text-foreground">{userReviewsCount}</p>
                <p className="text-xs text-muted-foreground">avaliação</p>
              </div>
              <Separator/>
              <div>
                <p className="font-semibold text-foreground whitespace-nowrap">{getMembershipDuration().replace("há ", "").replace("aproximadamente ", "")}</p> 
                <p className="text-xs text-muted-foreground">no WeStudy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-1 bg-card rounded-2xl shadow-sm overflow-hidden">
          <ProfileLinkItem
            icon={User}
            label="Informações pessoais"
            onClick={() => handleNavigate('Informações pessoais')}
          />
          <Separator className="mx-4 w-auto opacity-50" />
          <ProfileLinkItem
            icon={Settings}
            label="Configurações da conta"
            onClick={() => handleNavigate('Configurações da conta')}
          />
          <Separator className="mx-4 w-auto opacity-50" />
          <ProfileLinkItem
            icon={HelpCircle}
            label="Ajuda"
            onClick={() => handleNavigate('Ajuda')}
          />
        </div>

        <div className="mt-8 bg-card rounded-2xl shadow-sm overflow-hidden">
           <ProfileLinkItem
            icon={LogOut}
            label="Sair da conta"
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10"
            iconClassName="text-destructive"
          />
        </div>

      </div>
    </div>
  );
}

interface ProfileLinkItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
}

const ProfileLinkItem: React.FC<ProfileLinkItemProps> = ({ icon: Icon, label, onClick, className, iconClassName }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full text-left p-4 hover:bg-muted/50 transition-colors duration-150 focus:outline-none focus-visible:bg-muted/70 group ${className}`}
    >
      <Icon className={`h-6 w-6 mr-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ${iconClassName}`} />
      <span className="flex-grow text-md font-medium text-foreground">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground/70 ml-2" />
    </button>
  );
};
