import React from "react";

const mockOpportunity = {
  id: 1,
  dataEnvio: "2024-05-10",
  responsavelEnvio: "João Silva",
  empresaOrigem: "Cryah",
  empresaDestino: "Lomadee",
  lead: {
    empresa: "Empresa Exemplo S/A",
    contato: "Maria Oliveira",
    email: "maria@exemplo.com",
    telefone: "(11) 99999-8888",
  },
  status: "Em andamento",
  observacoes: "Lead com potencial alto. Aguardando retorno.",
  anexos: [
    { nome: "Proposta.pdf", url: "#" },
    { nome: "Contrato.docx", url: "#" },
  ],
  historico: [
    {
      data: "2024-05-10",
      responsavel: "João Silva",
      acao: "Oportunidade criada",
    },
    {
      data: "2024-05-12",
      responsavel: "Maria Oliveira",
      acao: "Contato realizado com o lead",
    },
  ],
};

const OpportunityDetail = () => {
  const opp = mockOpportunity;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        Detalhes da Oportunidade #{opp.id}
      </h1>
      <p className="text-muted-foreground mb-6">
        Visualize todas as informações e histórico desta oportunidade.
      </p>

      <div className="mb-6">
        <h2 className="font-semibold mb-1">Informações Gerais</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Data de envio:</span> {opp.dataEnvio}
          </div>
          <div>
            <span className="font-medium">Responsável:</span> {opp.responsavelEnvio}
          </div>
          <div>
            <span className="font-medium">Origem:</span> {opp.empresaOrigem}
          </div>
          <div>
            <span className="font-medium">Destino:</span> {opp.empresaDestino}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-1">Dados do Lead</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Empresa:</span> {opp.lead.empresa}
          </div>
          <div>
            <span className="font-medium">Contato:</span> {opp.lead.contato}
          </div>
          <div>
            <span className="font-medium">E-mail:</span> {opp.lead.email}
          </div>
          <div>
            <span className="font-medium">Telefone:</span> {opp.lead.telefone}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-1">Status & Observações</h2>
        <div className="mb-2">
          <span className="font-medium">Status:</span> {opp.status}
        </div>
        <div>
          <span className="font-medium">Observações:</span> {opp.observacoes}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-1">Anexos</h2>
        <ul className="list-disc ml-5">
          {opp.anexos.map((anexo, idx) => (
            <li key={idx}>
              <a href={anexo.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                {anexo.nome}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold mb-1">Histórico de Alterações</h2>
        <ul className="list-disc ml-5">
          {opp.historico.map((item, idx) => (
            <li key={idx}>
              <span className="font-medium">{item.data} - {item.responsavel}: </span>
              {item.acao}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OpportunityDetail;
