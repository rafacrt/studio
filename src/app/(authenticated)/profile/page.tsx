
"use client";

import { ExploreSearchBar } from '@/components/ExploreSearchBar';
import { CategoryMenu } from '@/components/CategoryMenu';
import { roomCategories } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle2, Mail, LogOut, Shield, Edit3, Settings, Info } from 'lucide-react'; // Added icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // router.push('/login?message=Logout realizado com sucesso'); // AuthContext handles this
  };

  const handleNavigate = (section: string) => {
    toast({
      title: "Navegação",
      description: `Seção "${section}" em desenvolvimento.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ExploreSearchBar />
      <CategoryMenu categories={roomCategories} selectedCategory={null} />
      
      <div className="container mx-auto px-2 py-8 md:px-4 lg:px-6 max-w-3xl">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30 p-6 text-center">
            <Avatar className="mx-auto h-24 w-24 mb-4 border-4 border-background shadow-md">
              <AvatarImage src={user?.avatarUrl} alt={user?.name || "Usuário"} data-ai-hint="user avatar large" />
              <AvatarFallback className="text-3xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle2 size={48} />}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-semibold text-foreground">
              {user?.name || "Nome do Usuário"}
            </CardTitle>
            {user?.email && (
              <CardDescription className="text-base text-muted-foreground flex items-center justify-center mt-1">
                <Mail className="h-4 w-4 mr-1.5" />
                {user.email}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="py-2">
              {/* Informações Pessoais */}
              <ProfileSectionItem
                icon={Info}
                title="Informações Pessoais"
                description="Visualize e atualize seus dados pessoais."
                onClick={() => handleNavigate('Informações Pessoais')}
              />
              <Separator className="mx-4 w-auto" />

              {/* Configurações da Conta */}
              <ProfileSectionItem
                icon={Settings}
                title="Configurações da Conta"
                description="Gerencie preferências e notificações."
                onClick={() => handleNavigate('Configurações da Conta')}
              />
              <Separator className="mx-4 w-auto" />
              
              {/* Login e Segurança */}
              <ProfileSectionItem
                icon={Shield}
                title="Login e Segurança"
                description="Altere sua senha e gerencie a segurança da conta."
                onClick={() => handleNavigate('Login e Segurança')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90 border-destructive hover:border-destructive/90 px-8 py-3 text-base rounded-lg shadow-md"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ProfileSectionItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

const ProfileSectionItem: React.FC<ProfileSectionItemProps> = ({ icon: Icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full text-left p-4 hover:bg-muted/50 transition-colors duration-150 focus:outline-none focus-visible:bg-muted/70"
    >
      <Icon className="h-6 w-6 mr-4 text-primary flex-shrink-0" />
      <div className="flex-grow">
        <h3 className="text-md font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Edit3 className="h-5 w-5 text-muted-foreground/70 ml-2 group-hover:text-primary transition-colors" />
    </button>
  );
};

