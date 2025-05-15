import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
