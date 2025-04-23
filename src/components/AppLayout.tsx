import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { 
  LogOut, Home, CheckSquare, Users, BarChart, Calendar, User 
} from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  hidden?: boolean;
}

const NavLink = ({ to, icon, label, active, hidden }: NavLinkProps) => {
  if (hidden) return null;
  
  return (
    <Link to={to} className={`flex items-center p-2 rounded-lg ${
      active ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
    } transition-all`}>
      <div className="mr-2">
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode, showBackButton?: boolean }> = ({ 
  children, 
  showBackButton = true 
}) => {
  const location = useLocation();
  const { logout, currentUser, userProfile } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = userProfile?.role === 'admin';
  const isGestor = userProfile?.role === 'gestor' || isAdmin;

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col">
      {/* Top header bar */}
      <header className="bg-[#222642] p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBackButton && location.pathname !== '/' && <BackButton />}
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm hidden md:block">
            {userProfile?.name || currentUser?.email} 
            {userProfile?.role && (
              <span className="ml-2 px-2 py-0.5 bg-white/10 text-xs rounded-full">
                {userProfile.role === 'admin' ? 'Admin' : 
                 userProfile.role === 'gestor' ? 'Gestor' : 'Vendedor'}
              </span>
            )}
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
              label="Tarefas Diárias" 
              active={isActive("/tarefas")} 
            />
            <NavLink 
              to="/relatorios" 
              icon={<Calendar size={18} />} 
              label="Relatórios" 
              active={isActive("/relatorios")} 
            />
            <NavLink 
              to="/equipe" 
              icon={<Users size={18} />} 
              label="Equipe" 
              active={isActive("/equipe")}
              hidden={!isGestor}
            />
            <NavLink 
              to="/usuarios" 
              icon={<User size={18} />} 
              label="Usuários" 
              active={isActive("/usuarios")}
              hidden={!isGestor}
            />
            <NavLink 
              to="/relatorio-equipe" 
              icon={<BarChart size={18} />} 
              label="Desempenho" 
              active={isActive("/relatorio-equipe")}
              hidden={!isGestor}
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
