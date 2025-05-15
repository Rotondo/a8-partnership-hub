import React from "react";

const indicadores = [
  { label: "Oportunidades Geradas", valor: 32 },
  { label: "Oportunidades Recebidas", valor: 28 },
  { label: "Taxa de Conversão", valor: "62%" },
];

const funil = [
  { etapa: "Indicação", total: 32 },
  { etapa: "Contato Realizado", total: 21 },
  { etapa: "Proposta Enviada", total: 14 },
  { etapa: "Negócio Fechado", total: 9 },
];

const empresasGrupo = ["Cryah", "Lomadee", "Monitfy", "B8one", "SAIO"];
const oportunidadesPorEmpresa = [
  { empresa: "Cryah", enviadas: 10, recebidas: 8 },
  { empresa: "Lomadee", enviadas: 7, recebidas: 6 },
  { empresa: "Monitfy", enviadas: 5, recebidas: 7 },
  { empresa: "B8one", enviadas: 6, recebidas: 4 },
  { empresa: "SAIO", enviadas: 4, recebidas: 3 },
];

const Reports = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Relatórios & Indicadores Estratégicos
      </h1>
      <p className="mb-8 text-muted-foreground">
        Acompanhe os principais indicadores de desempenho das parcerias do grupo A&amp;eight.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {indicadores.map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-muted p-6 flex flex-col items-center"
          >
            <span className="text-lg font-semibold">{item.label}</span>
            <span className="text-3xl font-bold mt-2">{item.valor}</span>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">Funil de Conversão</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {funil.map((etapa, idx) => (
            <div
              key={etapa.etapa}
              className="flex-1 bg-muted rounded-lg p-4 flex flex-col items-center"
            >
              <span className="font-medium">{etapa.etapa}</span>
              <span className="text-2xl font-bold">{etapa.total}</span>
              {idx < funil.length - 1 && (
                <span className="hidden md:inline-block mt-2 text-muted-foreground">
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <h2 className="font-semibold mb-2">Comparativo por Empresa</h2>
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted">Empresa</th>
              <th className="px-4 py-2 border bg-muted">Enviadas</th>
              <th className="px-4 py-2 border bg-muted">Recebidas</th>
            </tr>
          </thead>
          <tbody>
            {oportunidadesPorEmpresa.map((item) => (
              <tr key={item.empresa}>
                <td className="px-4 py-2 border">{item.empresa}</td>
                <td className="px-4 py-2 border text-center">{item.enviadas}</td>
                <td className="px-4 py-2 border text-center">{item.recebidas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
