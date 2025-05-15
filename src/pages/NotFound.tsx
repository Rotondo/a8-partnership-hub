import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <h1 className="text-4xl font-bold mb-4 text-destructive">404</h1>
      <p className="text-lg mb-2">Página não encontrada.</p>
      <p className="text-muted-foreground mb-6">
        O endereço acessado não existe ou foi removido.
      </p>
      <a
        href="/"
        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
      >
        Voltar para o início
      </a>
    </div>
  );
};

export default NotFound;
