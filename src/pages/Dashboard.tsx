
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Clock, User } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [taskStats, setTaskStats] = useState({
    todayTotal: 0,
    todayCompleted: 0,
    teamMembers: 0
  });

  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!currentUser) return;

      try {
        // Get today's date boundaries
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        
        // Query for today's tasks
        const tasksQuery = query(
          collection(db, "tarefas"),
          where("data", ">=", Timestamp.fromDate(startOfDay)),
          where("data", "<=", Timestamp.fromDate(endOfDay))
        );
        
        const taskSnapshot = await getDocs(tasksQuery);
        const todayTotal = taskSnapshot.size;
        
        // Count completed tasks
        let todayCompleted = 0;
        taskSnapshot.forEach(doc => {
          if (doc.data().status === "concluído") {
            todayCompleted++;
          }
        });
        
        // Get team members count
        const teamQuery = query(collection(db, "colaboradores"));
        const teamSnapshot = await getDocs(teamQuery);
        
        setTaskStats({
          todayTotal,
          todayCompleted,
          teamMembers: teamSnapshot.size
        });
      } catch (error) {
        console.error("Error fetching task stats:", error);
      }
    };
    
    fetchTaskStats();
  }, [currentUser]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">Dashboard</h1>
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
