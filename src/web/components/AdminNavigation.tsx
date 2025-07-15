
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BedDouble, Users, LogOut, Eye, PanelLeft, HousePlus } from 'lucide-react'; // Changed HomePlus to HousePlus
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/web/components/ui/sidebar';
import AppLogo from '@/web/components/AppLogo';
import { Button } from '@/web/components/ui/button';
import { useAuth } from '@/packages/auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/web/components/ui/avatar';

const adminNavItems = [
  { href: '/admin', label: 'Painel de Controle', icon: LayoutDashboard }, // Updated href
  { href: '/admin/room-approvals', label: 'Aprovações de Quartos', icon: BedDouble },
  { href: '/admin/user-management', label: 'Gerenciamento de Usuários', icon: Users },
  { href: '/admin/add-room', label: 'Adicionar Quarto', icon: HousePlus },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const { setOpen } = useSidebar();


  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
            <Link href="/admin" aria-label="Painel de Controle Principal">
              <AppLogo className="h-8 w-auto group-data-[collapsible=icon]:hidden" />
            </Link>
             <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setOpen(false)}>
                <PanelLeft />
             </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href === '/admin' && pathname === '/admin/dashboard')} // Handle exact match for /admin
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Ver Site Público">
                <Link href="/explore">
                  <Eye />
                  <span>Ver Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
        {user && (
            <div className="flex items-center gap-3 p-2 mt-2 rounded-md bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-0">
                <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="admin avatar" />
                    <AvatarFallback>{user.name.substring(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-sidebar-accent-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground">Administrador</span>
                </div>
            </div>
        )}
      </SidebarFooter>
    </>
  );
}
