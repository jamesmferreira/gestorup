
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut, Home, CheckSquare, Users, BarChart } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink = ({ to, icon, label, active }: NavLinkProps) => (
  <Link to={to} className={`flex items-center p-2 rounded-lg ${
    active ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
  } transition-all`}>
    <div className="mr-2">
      {icon}
    </div>
    <span>{label}</span>
  </Link>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col">
      {/* Top header bar */}
      <header className="bg-[#222642] p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm hidden md:block">
            {currentUser?.email}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/70 hover:text-white"
            onClick={() => logout()}
          >
            <LogOut size={18} />
            <span className="ml-1 hidden md:inline">Sair</span>
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <nav className="w-56 bg-[#222642] p-4">
          <div className="space-y-1 mt-4">
            <NavLink 
              to="/" 
              icon={<Home size={18} />} 
              label="Home" 
              active={isActive("/")} 
            />
            <NavLink 
              to="/tarefas" 
              icon={<CheckSquare size={18} />} 
              label="Tarefas" 
              active={isActive("/tarefas")} 
            />
            <NavLink 
              to="/equipe" 
              icon={<Users size={18} />} 
              label="Equipe" 
              active={isActive("/equipe")} 
            />
            <NavLink 
              to="/relatorio-equipe" 
              icon={<BarChart size={18} />} 
              label="Relatórios" 
              active={isActive("/relatorio-equipe")} 
            />
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
