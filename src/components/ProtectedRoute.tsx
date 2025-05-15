import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Exemplo de lógica de autenticação (ajuste conforme seu contexto)
const isAuthenticated = () => {
  // Troque por sua lógica real de autenticação (ex: checar token, contexto, etc)
  // Exemplo: return !!localStorage.getItem("user");
  return true; // Mude para false para simular usuário não logado
};

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redireciona para a página inicial ou login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se houver children, renderiza-os, senão renderiza o Outlet (para rotas aninhadas)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
