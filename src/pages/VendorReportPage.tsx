
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Download, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const fakeVendors = [
  {
    name: "Ana Silva",
    profilePic: undefined,
    tasksCompleted: 98,
    meta: 100,
    activities: [
      { label: "Stories", value: 60, color: "#22C55E" },
      { label: "Marketplace", value: 35, color: "#3B82F6" }
    ]
  },
  {
    name: "Carlos Santos",
    profilePic: undefined,
    tasksCompleted: 91,
    meta: 93,
    activities: [
      { label: "Stories", value: 55, color: "#22C55E" },
      { label: "Marketplace", value: 36, color: "#3B82F6" }
    ]
  },
  {
    name: "Júlia Oliveira",
    profilePic: undefined,
    tasksCompleted: 85,
    meta: 87,
    activities: [
      { label: "Stories", value: 54, color: "#22C55E" },
      { label: "Marketplace", value: 31, color: "#3B82F6" }
    ]
  }
];

const VendorReportPage = () => {
  const { nome } = useParams();
  const navigate = useNavigate();
  const vendor = fakeVendors.find(
    v => v.name.toLowerCase().includes((nome || "").toLowerCase())
  );

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-2">Vendedor não encontrado</h1>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1F2C] p-6">
      <header className="flex items-center mb-10">
        <span className="text-white text-2xl font-bold tracking-tight">GestorUp</span>
      </header>
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
    </div>
  );
};

export default VendorReportPage;
