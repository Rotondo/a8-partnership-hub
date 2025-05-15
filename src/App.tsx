import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import Partners from "./pages/Partners";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública para login/cadastro ou dashboard inicial */}
          <Route path="/" element={<Index />} />

          {/* Rotas protegidas dentro do layout do dashboard */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/oportunidades" element={<Opportunities />} />
            <Route path="/oportunidades/:id" element={<OpportunityDetail />} />
            <Route path="/parceiros" element={<Partners />} />
            <Route path="/relatorios" element={<Reports />} />
          </Route>

          {/* Rota para páginas não encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
