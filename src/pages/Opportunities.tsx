import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Opportunities = () => {
  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Oportunidades</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore todas as oportunidades de parceria (Versão Simplificada para Teste de Build)
          </p>
        </div>
        <div className="flex gap-2">
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nova Oportunidade (Desabilitado)
          </Button>
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <p className="text-center text-muted-foreground">
          Conteúdo principal da tabela de oportunidades será reintroduzido aqui após o build ser bem-sucedido.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Opportunities;

