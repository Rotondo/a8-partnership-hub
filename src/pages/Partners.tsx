import React from "react";

const empresasGrupo = ["Cryah", "Lomadee", "Monitfy", "B8one", "SAIO"];
const parceirosExternos = ["ParceiroX", "ParceiroY", "ParceiroZ"];

// Dados mockados para visualização do balanço
const balancoComercial = [
  {
    parceiro: "ParceiroX",
    enviadas: 5,
    recebidas: 3,
  },
  {
    parceiro: "ParceiroY",
    enviadas: 2,
    recebidas: 6,
  },
  {
    parceiro: "ParceiroZ",
    enviadas: 4,
    recebidas: 4,
  },
];

const Partners = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Parcerias Externas & Balanço Comercial
      </h1>
      <p className="mb-8 text-muted-foreground">
        Visualize o balanço de oportunidades trocadas entre o grupo A&amp;eight e parceiros externos.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted">Parceiro Externo</th>
              <th className="px-4 py-2 border bg-muted">Enviadas para Parceiro</th>
              <th className="px-4 py-2 border bg-muted">Recebidas do Parceiro</th>
              <th className="px-4 py-2 border bg-muted">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {balancoComercial.map((item) => (
              <tr key={item.parceiro}>
                <td className="px-4 py-2 border">{item.parceiro}</td>
                <td className="px-4 py-2 border text-center">{item.enviadas}</td>
                <td className="px-4 py-2 border text-center">{item.recebidas}</td>
                <td className="px-4 py-2 border text-center font-bold">
                  {item.recebidas - item.enviadas}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted"></th>
              {parceirosExternos.map((parceiro) => (
                <th key={parceiro} className="px-4 py-2 border bg-muted">
                  {parceiro}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empresasGrupo.map((empresa) => (
              <tr key={empresa}>
                <td className="px-4 py-2 border font-semibold bg-muted">
                  {empresa}
                </td>
                {parceirosExternos.map((parceiro) => (
                  <td key={parceiro} className="px-4 py-2 border text-center">
                    {/* Exemplo de valor mockado */}
                    {Math.floor(Math.random() * 5)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Partners;
