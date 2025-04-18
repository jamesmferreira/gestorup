
import React from 'react';
import Logo from '@/components/Logo';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  User, 
  Medal,
  Calendar,
  CheckCircle,
  Users,
  CalendarCheck,
  Download,
  BarChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type TeamMemberReport = {
  id: number;
  name: string;
  profilePic?: string;
  tasksCompleted: number;
  targetPercentage: number;
};

const teamReports: TeamMemberReport[] = [
  { id: 1, name: 'Ana Silva', tasksCompleted: 98, targetPercentage: 100 },
  { id: 2, name: 'Carlos Santos', tasksCompleted: 91, targetPercentage: 93 },
  { id: 3, name: 'Júlia Oliveira', tasksCompleted: 85, targetPercentage: 87 },
];

const barChartData = [
  { name: 'Ana', tasks: 98 },
  { name: 'Carlos', tasks: 91 },
  { name: 'Júlia', tasks: 85 },
  { name: 'Pedro', tasks: 82 },
  { name: 'Lucas', tasks: 78 },
];

const pieChartData = [
  { name: 'Stories', value: 60, color: '#22C55E' },
  { name: 'Marketplace', value: 35, color: '#3B82F6' },
];

const generalMetrics = {
  tasksCompleted: 315,
  tasksTotal: 350,
  participation: 100,
  daysUpdated: 18,
  totalDays: 30,
  averageActivity: 95
};

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

  const handleDownloadPDF = () => {
    console.log('Downloading PDF report...');
    // Future implementation: PDF generation and download
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] p-6">
      <header className="flex justify-between items-center mb-12">
        <Logo />
      </header>
      
      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl font-medium mb-2">
            Relatório Mensal da Equipe
          </h1>
          <h2 className="text-gray-400 text-xl">
            Desempenho do Time - Abril 2025
          </h2>
        </div>

        {/* General Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/5 border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-400 w-5 h-5" />
                <h3 className="text-white text-lg">Tarefas Concluídas</h3>
              </div>
              <p className="text-2xl text-white font-semibold">
                {generalMetrics.tasksCompleted} / {generalMetrics.tasksTotal}
              </p>
              <Progress 
                value={(generalMetrics.tasksCompleted / generalMetrics.tasksTotal) * 100}
                className="mt-2"
              />
            </div>
          </Card>

          <Card className="bg-white/5 border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-blue-400 w-5 h-5" />
                <h3 className="text-white text-lg">Participação dos Vendedores</h3>
              </div>
              <p className="text-2xl text-white font-semibold">
                {generalMetrics.participation}%
              </p>
              <Progress value={generalMetrics.participation} className="mt-2" />
            </div>
          </Card>

          <Card className="bg-white/5 border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarCheck className="text-purple-400 w-5 h-5" />
                <h3 className="text-white text-lg">Dias com Atualização</h3>
              </div>
              <p className="text-2xl text-white font-semibold">
                {generalMetrics.daysUpdated} / {generalMetrics.totalDays} dias
              </p>
              <Progress 
                value={(generalMetrics.daysUpdated / generalMetrics.totalDays) * 100}
                className="mt-2"
              />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Activity Distribution Pie Chart */}
          <Card className="bg-white/5 border-0 p-6">
            <h3 className="text-white text-lg mb-4">Média Diária de Atividades</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {pieChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-white text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Tasks Bar Chart */}
          <Card className="bg-white/5 border-0 p-6">
            <h3 className="text-white text-lg mb-4">Tarefas Concluídas por Vendedor</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3B82F6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Ranking Section */}
        <div className="space-y-6 mb-12">
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
                  <Medal className={`
                    absolute -top-2 -right-2 w-6 h-6
                    ${index === 0 ? 'text-yellow-400' : ''}
                    ${index === 1 ? 'text-gray-300' : ''}
                    ${index === 2 ? 'text-orange-700' : ''}
                  `} />
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

        {/* Download Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleDownloadPDF}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Download className="w-5 h-5" />
            Baixar Relatório em PDF
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TeamReportPage;
