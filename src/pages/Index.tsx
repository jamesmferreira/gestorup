
import React from 'react';
import Logo from '@/components/Logo';
import ActionCard from '@/components/ActionCard';
import { CheckCircle, Plus, Users, BarChart } from 'lucide-react';

const Index = () => {
  const userName = "João"; // This would come from authentication later

  const actions = [
    {
      title: "Resumo de Atividades",
      icon: CheckCircle,
      color: "text-[#F97316]",
      onClick: () => console.log("Resumo clicked")
    },
    {
      title: "Nova Atividade",
      icon: Plus,
      color: "text-[#22C55E]",
      onClick: () => console.log("Nova atividade clicked")
    },
    {
      title: "Ver Equipe",
      icon: Users,
      color: "text-[#00F0FF]",
      onClick: () => console.log("Ver equipe clicked")
    },
    {
      title: "Relatórios",
      icon: BarChart,
      color: "text-[#E5E7EB]",
      onClick: () => console.log("Relatórios clicked")
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1F2C] p-6">
      <header className="flex justify-between items-center mb-12">
        <Logo />
      </header>
      
      <main className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl md:text-3xl font-medium mb-12">
          Olá, {userName}! Pronto para acompanhar sua equipe?
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              icon={action.icon}
              color={action.color}
              onClick={action.onClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
