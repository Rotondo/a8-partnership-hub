import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import Partners from "./pages/Partners";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function App() {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Index />} />

      {/* Rotas protegidas dentro do layout do dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/oportunidades" element={<Opportunities />} />
        <Route path="/oportunidades/:id" element={<OpportunityDetail />} />
        <Route path="/parceiros" element={<Partners />} />
        <Route path="/relatorios" element={<Reports />} />
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
