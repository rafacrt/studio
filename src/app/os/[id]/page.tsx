'use client'; 

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Fixed syntax: _from -> from
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import OSDetailsView from '@/components/os/OSDetailsView';
import { useOSStore } from '@/store/os-store';
import type { OS } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function OSDetailsPage() {
  const params = useParams();
  // const router = useRouter(); // Not used
  const getOSById = useOSStore((state) => state.getOSById);
  
  const [os, setOs] = useState<OS | undefined | null>(undefined); // undefined: loading, null: not found

  const id = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (id) {
      const foundOS = getOSById(id);
      setOs(foundOS || null); 
    } else {
      setOs(null); 
    }
  }, [id, getOSById]);

  if (os === undefined) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Carregando detalhes da OS...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (os === null) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">Ordem de Serviço Não Encontrada</h2>
          <p className="text-muted-foreground mb-6">A OS que você está procurando não existe ou não pôde ser carregada.</p>
          <Button asChild>
            <Link href="/dashboard">Ir para o Painel</Link>
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <OSDetailsView os={os} />
    </AuthenticatedLayout>
  );
}
