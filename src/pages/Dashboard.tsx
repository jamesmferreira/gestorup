
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Clock, User, LogOut } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [taskStats, setTaskStats] = useState({
    todayTotal: 0,
    todayCompleted: 0,
    teamMembers: 0
  });

  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!currentUser) return;

      try {
        // Fetch task stats using Supabase instead of Firestore
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('company_id', currentUser.user_metadata.company_id)
          .eq('date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        const todayTotal = tasks.length;
        const todayCompleted = tasks.filter(task => task.status === 'concluido').length;

        const { data: teamMembers, error: teamError } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', currentUser.user_metadata.company_id);

        if (teamError) throw teamError;

        setTaskStats({
          todayTotal,
          todayCompleted,
          teamMembers: teamMembers.length
        });
      } catch (error) {
        console.error("Error fetching task stats:", error);
      }
    };
    
    fetchTaskStats();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AppLayout showBackButton={false}>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-3xl font-semibold mb-2">Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-white border-white/20 hover:bg-white/10 flex items-center gap-2"
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
        <p className="text-white/70">Bem-vindo ao GestorUp, seu sistema de gestão de equipes e tarefas.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/5 border-0 p-4">
          <div className="flex items-center">
            <div className="bg-[#22C55E]/20 p-3 rounded-full mr-4">
              <CheckCircle size={24} className="text-[#22C55E]" />
            </div>
            <div>
              <p className="text-white/70">Tarefas Concluídas Hoje</p>
              <h3 className="text-white text-2xl font-semibold">
                {taskStats.todayCompleted} / {taskStats.todayTotal}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white/5 border-0 p-4">
          <div className="flex items-center">
            <div className="bg-[#F97316]/20 p-3 rounded-full mr-4">
              <Clock size={24} className="text-[#F97316]" />
            </div>
            <div>
              <p className="text-white/70">Tarefas Pendentes</p>
              <h3 className="text-white text-2xl font-semibold">
                {taskStats.todayTotal - taskStats.todayCompleted}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white/5 border-0 p-4">
          <div className="flex items-center">
            <div className="bg-[#00F0FF]/20 p-3 rounded-full mr-4">
              <User size={24} className="text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white/70">Colaboradores</p>
              <h3 className="text-white text-2xl font-semibold">
                {taskStats.teamMembers}
              </h3>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate("/tarefas")}
          className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#1A1F2C] font-medium px-8 py-6 gap-2 text-lg"
        >
          <Plus size={20} />
          Criar Tarefa
        </Button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
