
"use client";

import { LockKeyhole, UnlockKeyhole, Loader2 } from 'lucide-react';

interface UnlockDoorAnimationProps {
  isUnlocking: boolean;
  isUnlocked: boolean;
}

export function UnlockDoorAnimation({ isUnlocking, isUnlocked }: UnlockDoorAnimationProps) {
  if (isUnlocking) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Destrancando...</span>
      </div>
    );
  }

  if (isUnlocked) {
    return (
      <div className="flex items-center justify-center space-x-2 text-green-500">
        <UnlockKeyhole className="h-5 w-5" />
        <span>Destrancado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <LockKeyhole className="h-5 w-5" />
      <span>Destrancar Porta</span>
    </div>
  );
}
