
import React from 'react';
import Logo from '@/components/Logo';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileText, User, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TeamMemberReport = {
  id: number;
  name: string;
  profilePic?: string;
  tasksCompleted: number;
  targetPercentage: number;
};

const teamReports: TeamMemberReport[] = [
  { id: 1, name: 'Maria Silva', tasksCompleted: 95, targetPercentage: 106 },
  { id: 2, name: 'João Santos', tasksCompleted: 88, targetPercentage: 98 },
  { id: 3, name: 'Ana Oliveira', tasksCompleted: 82, targetPercentage: 91 },
];

const getRankColor = (index: number) => {
  switch (index) {
    case 0:
      return 'bg-gradient-to-r from-yellow-300 to-yellow-500'; // Gold
    case 1:
      return 'bg-gradient-to-r from-gray-300 to-gray-400'; // Silver
    case 2:
      return 'bg-gradient-to-r from-orange-700 to-orange-800'; // Bronze
    default:
      return 'bg-white/10';
  }
};

const TeamReportPage = () => {
  const navigate = useNavigate();

  const handleViewDetails = (memberId: number) => {
    console.log(`Viewing details for member ${memberId}`);
    // Future implementation: navigate to individual report
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] p-6">
      <header className="flex justify-between items-center mb-12">
        <Logo />
      </header>
      
      <main className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-medium text-center mb-12">
          Relatório Mensal da Equipe
        </h1>
        
        <div className="space-y-6">
          {teamReports.map((member, index) => (
            <Card 
              key={member.id}
              className={`${getRankColor(index)} border-0 hover:brightness-110 transition-all`}
            >
              <div className="p-6 flex items-center gap-6 backdrop-blur-sm">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.profilePic} />
                    <AvatarFallback>
                      <User className="w-8 h-8 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <Medal className={`
                      absolute -top-2 -right-2 w-6 h-6
                      ${index === 0 ? 'text-yellow-400' : ''}
                      ${index === 1 ? 'text-gray-300' : ''}
                      ${index === 2 ? 'text-orange-700' : ''}
                    `} />
                  )}
                </div>

                <div className="flex-grow">
                  <h2 className="text-white text-xl font-semibold mb-2">{member.name}</h2>
                  <div className="flex gap-8">
                    <span className="text-white/90">
                      Tarefas Concluídas: <strong>{member.tasksCompleted}</strong>
                    </span>
                    <span className={`font-semibold ${
                      member.targetPercentage >= 100 ? 'text-green-400' : 'text-white/90'
                    }`}>
                      Meta: {member.targetPercentage}%
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewDetails(member.id)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <FileText className="mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeamReportPage;
