
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Download, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/sonner";

interface VendorData {
  id: string;
  name: string;
  profilePic?: string;
  tasksCompleted: number;
  totalTasks: number;
  meta: number;
  activities: {
    label: string;
    value: number;
    color: string;
  }[];
}

const VendorReportPage = () => {
  const { nome } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!nome) return;
      
      try {
        // Find the colaborador by name
        const colaboradoresRef = collection(db, "colaboradores");
        const q = query(colaboradoresRef, where("nome", "==", nome));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setLoading(false);
          return; // No matching vendor found
        }
        
        const colaboradorDoc = querySnapshot.docs[0];
        const colaboradorId = colaboradorDoc.id;
        
        // Fetch tasks associated with this colaborador
        const tasksRef = collection(db, "tarefas");
        const tasksQuery = query(tasksRef, where("colaborador_id", "==", colaboradorId));
        const tasksSnapshot = await getDocs(tasksQuery);
        
        let completedTasks = 0;
        let pendingTasks = 0;
        
        tasksSnapshot.forEach(doc => {
          if (doc.data().status === "concluído") {
            completedTasks++;
          } else {
            pendingTasks++;
          }
        });
        
        const totalTasks = completedTasks + pendingTasks;
        const metaPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Create vendor object
        const vendorData: VendorData = {
          id: colaboradorId,
          name: colaboradorDoc.data().nome,
          profilePic: undefined,
          tasksCompleted: completedTasks,
          totalTasks: totalTasks,
          meta: metaPercentage,
          activities: [
            { label: "Stories", value: Math.floor(completedTasks * 0.6), color: "#22C55E" },
            { label: "Marketplace", value: Math.floor(completedTasks * 0.4), color: "#3B82F6" }
          ]
        };
        
        setVendor(vendorData);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        toast.error("Erro ao carregar dados do vendedor");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
  }, [nome]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Carregando dados...</p>
        </div>
      </AppLayout>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-2">Vendedor não encontrado</h1>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/equipe")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="max-w-2xl mx-auto">
        <h1 className="text-white text-3xl font-semibold mb-3 text-center">
          Relatório Individual
        </h1>
        <h2 className="text-gray-400 text-md mb-8 text-center">{`Atuação no mês de Abril 2025`}</h2>
        <Card className="bg-white/5 border-0 p-6 flex flex-col items-center mb-10 shadow-lg">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={vendor.profilePic} />
            <AvatarFallback>
              <User className="w-10 h-10 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-2xl font-semibold">{vendor.name}</span>
          <div className="mt-6 w-full flex flex-col items-center">
            <span className="text-gray-300 text-lg mb-1">Tarefas Concluídas</span>
            <span className="text-white text-4xl font-bold mb-2">{vendor.tasksCompleted}</span>
            <Progress value={Math.min(vendor.meta, 100)} className="w-full bg-[#222642] h-3 [&>div]:bg-green-500" />
            <span className={`mt-2 text-md font-semibold ${vendor.meta >= 100 ? "text-green-400" : "text-gray-200"}`}>
              Meta atingida: {vendor.meta}%
            </span>
          </div>
          <div className="mt-8 w-full">
            <h3 className="text-white text-lg mb-4">Atividades Realizadas</h3>
            <div className="flex gap-8 justify-center">
              {vendor.activities.map(a => (
                <div key={a.label} className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{
                      background: a.color + "22"
                    }}
                  >
                    <div className="w-6 h-6 rounded-full" style={{ background: a.color }} />
                  </div>
                  <span className="text-sm text-white">{a.label}</span>
                  <span className="text-md text-white font-bold">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" size="lg">
            <Download className="w-5 h-5" />
            Baixar Relatório em PDF
          </Button>
        </div>
      </main>
    </AppLayout>
  );
};

export default VendorReportPage;
