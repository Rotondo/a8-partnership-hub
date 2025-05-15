import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Opportunities = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Oportunidades</h1>
        <Button disabled variant="outline" className="gap-2">
          <Plus size={16} />
          Nova Oportunidade
        </Button>
      </div>
      <p className="mb-4 text-muted-foreground">
        Gerencie e monitore todas as oportunidades de parceria do grupo A&eight e parceiros externos.
      </p>
      <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
        Conteúdo principal da tabela de oportunidades será reintroduzido aqui após o build ser bem-sucedido.
      </div>
    </div>
  );
};

export default Opportunities;
