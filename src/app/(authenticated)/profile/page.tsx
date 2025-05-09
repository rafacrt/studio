"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Edit3, Settings, HelpCircle, LogOut, Shield, CreditCard, Bell } from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/utils';
import Link from 'next/link';

const menuOptions = [
  { label: 'Personal Info', icon: Edit3, href: '/profile/edit' },
  { label: 'Account Settings', icon: Settings, href: '/profile/settings' },
  { label: 'Login & Security', icon: Shield, href: '/profile/security' },
  { label: 'Payments & Payouts', icon: CreditCard, href: '/profile/payments' },
  { label: 'Notifications', icon: Bell, href: '/profile/notifications' },
  { label: 'Get Help', icon: HelpCircle, href: '/support' },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    // This should ideally be handled by the AuthenticatedLayout, but as a fallback:
    return <div className="p-4 text-center">Loading user profile...</div>;
  }

  const handleLogout = () => {
    triggerHapticFeedback();
    logout();
  };

  return (
    <div className="container mx-auto px-0 py-6 sm:px-4">
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-foreground mb-8">Profile</h1>
      </div>
      
      {/* User Info Card */}
      <Card className="mb-8 shadow-lg rounded-xl overflow-hidden mx-4 sm:mx-0">
        <CardContent className="p-6 flex items-center space-x-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
            <AvatarFallback className="text-2xl">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Button variant="link" className="p-0 h-auto text-primary text-sm mt-1" asChild>
              <Link href="/profile/edit" onClick={() => triggerHapticFeedback(5)}>Edit profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-1 mx-0 sm:mx-0">
        {menuOptions.map((item, index) => (
          <React.Fragment key={item.label}>
            <Link href={item.href} onClick={() => triggerHapticFeedback(5)}>
              <div className="flex items-center justify-between p-4 bg-card hover:bg-secondary/50 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl sm:first:rounded-t-lg sm:last:rounded-b-lg">
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-base text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
            {index < menuOptions.length -1 && <Separator className="my-0 bg-border mx-4 sm:mx-0" />}
          </React.Fragment>
        ))}
      </div>
      
      {/* Logout Button */}
      <div className="mt-10 px-4 sm:px-0">
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 focus:ring-destructive/50 py-3 text-base"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground px-4 sm:px-0">
        Version 1.0.0 (Build 202407)
      </p>
    </div>
  );
}

// Placeholder pages for menu items to avoid 404s
export function EditProfilePage() { return <div className="p-4">Edit Profile Page Content</div>; }
export function SettingsPage() { return <div className="p-4">Account Settings Page Content</div>; }
// ... etc.
