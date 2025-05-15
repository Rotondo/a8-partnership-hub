import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // ou o caminho correto para seu Sidebar

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet /> {/* Aqui as páginas filhas serão renderizadas */}
      </main>
    </div>
  );
};

export default DashboardLayout;
