"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, CalendarCheck, UserCircle2, KeyRound } from 'lucide-react';
import { cn, triggerHapticFeedback } from '@/lib/utils';

const navItems = [
  { href: '/explore', label: 'Explorar', icon: Compass },
  { href: '/bookings', label: 'Reservas', icon: CalendarCheck },
  { href: '/profile', label: 'Perfil', icon: UserCircle2 },
  { href: '/access', label: 'Acesso', icon: KeyRound },
];

export function BottomNavigationBar() {
  const pathname = usePathname();

  const handleNavClick = () => {
    triggerHapticFeedback(5); 
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 shadow-top backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/explore' && pathname.startsWith('/room/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex flex-1 flex-col items-center justify-center space-y-1 rounded-md p-2 text-xs font-medium transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

