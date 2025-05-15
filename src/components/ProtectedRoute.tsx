import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Exemplo básico: troque por sua lógica real de autenticação
function isAuthenticated() {
  // Exemplo: verifique se há um token no localStorage ou contexto
  // return !!localStorage.getItem("token");
  // Para testes, retorne sempre true para liberar o acesso
  return true;
}

const ProtectedRoute: React.FC = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redireciona para a página inicial ou de login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Renderiza as rotas filhas protegidas
  return <Outlet />;
};

export default ProtectedRoute;
