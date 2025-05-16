
import React from "react";
import { NavLink } from "react-router-dom";
import { PieChart, LineChart, Users, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">A&amp;eight Hub</h2>
        <p className="text-sm text-muted-foreground">Dashboard de Parcerias</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`
          }
        >
          <PieChart size={16} />
          <span>Visão Geral</span>
        </NavLink>
        
        <NavLink
          to="/opportunities"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`
          }
        >
          <Package size={16} />
          <span>Oportunidades</span>
        </NavLink>
        
        <NavLink
          to="/partners"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`
          }
        >
          <Users size={16} />
          <span>Parceiros</span>
        </NavLink>
        
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`
          }
        >
          <LineChart size={16} />
          <span>Relatórios</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings size={16} />
          <span>Configurações</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
