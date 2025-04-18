
import React from 'react';
import Logo from '@/components/Logo';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleMemberClick = (memberName: string) => {
    // Placeholder for future navigation to member details
    console.log(`Clicked on member: ${memberName}`);
  };

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
            <Card 
              key={index}
              className="bg-white/10 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              onClick={() => handleMemberClick(member.name)}
            >
              <div className="p-6 flex items-center">
                <div className="flex-grow">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={member.profilePic} />
                      <AvatarFallback>
                        <User className="w-6 h-6 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-white text-xl font-semibold">{member.name}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress 
                      value={(member.tasksCompleted / member.totalTasks) * 100}
                      className="flex-grow bg-gray-700"
                    />
                    <span className="text-white/70 text-sm">
                      {member.tasksCompleted}/{member.totalTasks}
                    </span>
                  </div>
                </div>
                <ChevronRight className="ml-4 text-[#00F0FF]" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
