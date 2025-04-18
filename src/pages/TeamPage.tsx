
import React from 'react';
import Logo from '@/components/Logo';
import { Users, ChevronRight } from 'lucide-react';

type TeamMember = {
  name: string;
  profilePic?: string;
  tasksCompleted: number;
  totalTasks: number;
};

const teamMembers: TeamMember[] = [
  { name: 'Maria Silva', tasksCompleted: 75, totalTasks: 90 },
  { name: 'João Santos', tasksCompleted: 62, totalTasks: 90 },
  { name: 'Ana Oliveira', tasksCompleted: 88, totalTasks: 90 },
];

const TeamPage = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] p-6">
      <header className="flex justify-between items-center mb-12">
        <Logo />
      </header>
      
      <main className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-medium mb-8">
          Tarefas do Mês - Equipe
        </h1>
        
        <div className="space-y-6">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-white/10 border border-white/20 rounded-xl p-6 flex items-center hover:bg-white/20 transition-all"
            >
              <div className="flex-grow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full mr-4"></div>
                  <h2 className="text-white text-xl font-semibold">{member.name}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-grow bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#22C55E] rounded-full h-2" 
                      style={{width: `${(member.tasksCompleted / member.totalTasks) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-white/70 text-sm">
                    {member.tasksCompleted}/{member.totalTasks}
                  </span>
                </div>
              </div>
              <button className="ml-4 text-[#00F0FF] hover:scale-110 transition-transform">
                <ChevronRight size={24} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
