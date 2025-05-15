import React from "react";

const empresasGrupo = [
  "Cryah",
  "Lomadee",
  "Monitfy",
  "B8one",
  "SAIO"
];

// Exemplo de dados mockados para a matriz de indicações
const intraGroupChartData = {
  Cryah: { Lomadee: 3, Monitfy: 2, B8one: 1, SAIO: 0 },
  Lomadee: { Cryah: 2, Monitfy: 0, B8one: 1, SAIO: 2 },
  Monitfy: { Cryah: 1, Lomadee: 2, B8one: 0, SAIO: 1 },
  B8one: { Cryah: 0, Lomadee: 1, Monitfy: 2, SAIO: 0 },
  SAIO: { Cryah: 2, Lomadee: 1, Monitfy: 1, B8one: 1 }
};

const Index = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard de Parcerias A&amp;eight
      </h1>
      <p className="mb-8 text-muted-foreground">
        Monitore e analise as oportunidades de parceria internas e externas do grupo A&amp;eight.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted"></th>
              {empresasGrupo.map((company) => (
                <th key={company} className="px-4 py-2 border bg-muted">
                  {company}
                </th>
              ))}
              <th className="px-4 py-2 border bg-muted">Total Enviado</th>
            </tr>
          </thead>
          <tbody>
            {empresasGrupo.map((source) => {
              const targets = intraGroupChartData[source] || {};
              const totalSent = Object.values(targets).reduce(
                (sum, count) => sum + count,
                0
              );
              return (
                <tr key={source}>
                  <td className="px-4 py-2 border font-semibold bg-muted">
                    {source}
                  </td>
                  {empresasGrupo.map((target) => (
                    <td key={target} className="px-4 py-2 border text-center">
                      {source === target
                        ? "–"
                        : targets[target] > 0
                        ? targets[target]
                        : 0}
                    </td>
                  ))}
                  <td className="px-4 py-2 border font-bold text-center">
                    {totalSent}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="px-4 py-2 border font-semibold bg-muted">
                Total Recebido
              </td>
              {empresasGrupo.map((company) => {
                const totalReceived = empresasGrupo.reduce((sum, source) => {
                  if (source === company) return sum;
                  const targets = intraGroupChartData[source] || {};
                  return sum + (targets[company] || 0);
                }, 0);
                return (
                  <td
                    key={company}
                    className="px-4 py-2 border font-bold text-center"
                  >
                    {totalReceived}
                  </td>
                );
              })}
              <td className="px-4 py-2 border bg-muted"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Index;
