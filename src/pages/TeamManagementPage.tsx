
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/sonner";
import { User, Plus, Edit } from "lucide-react";

interface ColaboradorFormData {
  nome: string;
  email: string;
  cargo?: string;
}

interface Colaborador extends ColaboradorFormData {
  id: string;
}

const TeamManagementPage = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ColaboradorFormData>();

  const loadColaboradores = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "colaboradores"), orderBy("nome"));
      const querySnapshot = await getDocs(q);
      const colaboradoresList: Colaborador[] = [];
      
      querySnapshot.forEach((doc) => {
        colaboradoresList.push({
          id: doc.id,
          ...doc.data() as ColaboradorFormData
        });
      });
      
      setColaboradores(colaboradoresList);
    } catch (error) {
      console.error("Error fetching colaboradores:", error);
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadColaboradores();
  }, []);

  const openNewColaboradorDialog = () => {
    setEditingColaborador(null);
    reset({
      nome: "",
      email: "",
      cargo: ""
    });
    setIsDialogOpen(true);
  };

  const openEditColaboradorDialog = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setValue("nome", colaborador.nome);
    setValue("email", colaborador.email);
    setValue("cargo", colaborador.cargo || "");
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ColaboradorFormData) => {
    try {
      if (editingColaborador) {
        // Update colaborador
        const colaboradorRef = doc(db, "colaboradores", editingColaborador.id);
        await updateDoc(colaboradorRef, data);
        toast.success("Colaborador atualizado com sucesso");
      } else {
        // Create new colaborador
        await addDoc(collection(db, "colaboradores"), data);
        toast.success("Colaborador adicionado com sucesso");
      }
      
      setIsDialogOpen(false);
      loadColaboradores();
    } catch (error) {
      console.error("Error saving colaborador:", error);
      toast.error("Erro ao salvar colaborador");
    }
  };

  const handleViewColaboradorReport = (colaboradorId: string) => {
    // Find the colaborador to get their name for the URL
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    if (colaborador) {
      navigate(`/relatorio-vendedor/${encodeURIComponent(colaborador.nome)}`);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white text-3xl font-semibold mb-2">Equipe</h1>
          <p className="text-white/70">Gerencie os membros da sua equipe</p>
        </div>
        <Button 
          onClick={openNewColaboradorDialog}
          className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#1A1F2C]"
        >
          <Plus size={18} className="mr-1" />
          Adicionar Colaborador
        </Button>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <p className="text-white">Carregando colaboradores...</p>
        </div>
      ) : colaboradores.length === 0 ? (
        <Card className="bg-white/5 border-0 p-8 text-center">
          <p className="text-white/70 mb-4">Nenhum colaborador cadastrado</p>
          <Button 
            onClick={openNewColaboradorDialog}
            variant="ghost" 
            className="text-[#00F0FF]"
          >
            <Plus size={18} className="mr-1" />
            Adicionar primeiro colaborador
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colaboradores.map(colaborador => (
            <Card 
              key={colaborador.id}
              className="bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        <User className="w-6 h-6 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-white text-xl font-semibold">{colaborador.nome}</h2>
                      <p className="text-white/60 text-sm">{colaborador.cargo || "Colaborador"}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[#00F0FF]"
                    onClick={() => openEditColaboradorDialog(colaborador)}
                  >
                    <Edit size={16} />
                  </Button>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  <span className="text-white/60">Email:</span> {colaborador.email}
                </p>
                
                <Button 
                  onClick={() => handleViewColaboradorReport(colaborador.id)}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Ver Relatório
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Colaborador Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#222642] text-white border-0 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-white/80 mb-1">
                Nome Completo
              </label>
              <Input
                id="nome"
                className="bg-white/5 border-white/20 text-white"
                placeholder="Nome do colaborador"
                {...register("nome", { required: "Nome é obrigatório" })}
              />
              {errors.nome && (
                <p className="text-red-400 text-sm mt-1">{errors.nome.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                className="bg-white/5 border-white/20 text-white"
                placeholder="email@exemplo.com"
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-white/80 mb-1">
                Cargo
              </label>
              <Input
                id="cargo"
                className="bg-white/5 border-white/20 text-white"
                placeholder="Cargo (opcional)"
                {...register("cargo")}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#1A1F2C]"
              >
                {editingColaborador ? "Salvar Alterações" : "Adicionar Colaborador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TeamManagementPage;
