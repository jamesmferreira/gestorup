
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2, CheckCircle, Circle } from "lucide-react";

interface TaskFormData {
  nome: string;
  descricao: string;
  colaborador_id: string;
  status: "pendente" | "concluído";
  data: string;
}

interface Task extends TaskFormData {
  id: string;
  colaboradorNome?: string;
}

interface Colaborador {
  id: string;
  nome: string;
}

const TasksPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>();

  const loadColaboradores = async () => {
    try {
      const q = query(collection(db, "colaboradores"), orderBy("nome"));
      const querySnapshot = await getDocs(q);
      const colaboradoresList: Colaborador[] = [];
      
      querySnapshot.forEach((doc) => {
        colaboradoresList.push({
          id: doc.id,
          nome: doc.data().nome
        });
      });
      
      setColaboradores(colaboradoresList);
    } catch (error) {
      console.error("Error fetching colaboradores:", error);
      toast.error("Erro ao carregar colaboradores");
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "tarefas"), orderBy("data", "desc"));
      const querySnapshot = await getDocs(q);
      const tasksList: Task[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const taskData = docSnapshot.data();
        const colaboradorDoc = colaboradores.find(c => c.id === taskData.colaborador_id);
        
        tasksList.push({
          id: docSnapshot.id,
          nome: taskData.nome,
          descricao: taskData.descricao,
          colaborador_id: taskData.colaborador_id,
          colaboradorNome: colaboradorDoc?.nome || "Não atribuído",
          status: taskData.status,
          data: taskData.data.toDate().toISOString().split('T')[0]
        });
      }
      
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadColaboradores();
  }, []);
  
  useEffect(() => {
    if (colaboradores.length > 0) {
      loadTasks();
    }
  }, [colaboradores]);

  const openNewTaskDialog = () => {
    setEditingTask(null);
    reset({
      nome: "",
      descricao: "",
      colaborador_id: "",
      status: "pendente",
      data: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setValue("nome", task.nome);
    setValue("descricao", task.descricao);
    setValue("colaborador_id", task.colaborador_id);
    setValue("status", task.status);
    setValue("data", task.data);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        data: Timestamp.fromDate(new Date(data.data))
      };
      
      if (editingTask) {
        // Update task
        const taskRef = doc(db, "tarefas", editingTask.id);
        await updateDoc(taskRef, taskData);
        toast.success("Tarefa atualizada com sucesso");
      } else {
        // Create new task
        await addDoc(collection(db, "tarefas"), taskData);
        toast.success("Tarefa criada com sucesso");
      }
      
      setIsDialogOpen(false);
      loadTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Erro ao salvar tarefa");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await deleteDoc(doc(db, "tarefas", taskId));
        toast.success("Tarefa excluída com sucesso");
        loadTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Erro ao excluir tarefa");
      }
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "pendente" ? "concluído" : "pendente";
      const taskRef = doc(db, "tarefas", task.id);
      await updateDoc(taskRef, { status: newStatus });
      toast.success(`Tarefa marcada como ${newStatus}`);
      loadTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-white text-3xl font-semibold mb-2">Tarefas</h1>
          <p className="text-white/70">Gerencie as tarefas da equipe</p>
        </div>
        <Button 
          onClick={openNewTaskDialog}
          className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#1A1F2C]"
        >
          <Plus size={18} className="mr-1" />
          Nova Tarefa
        </Button>
      </div>
      
      <Card className="bg-white/5 border-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-white">Carregando tarefas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/70">Nenhuma tarefa encontrada</p>
            <Button 
              onClick={openNewTaskDialog}
              variant="ghost" 
              className="mt-4 text-[#00F0FF]"
            >
              <Plus size={18} className="mr-1" />
              Criar primeira tarefa
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-white/10">
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Tarefa</TableHead>
                  <TableHead className="text-white/70">Responsável</TableHead>
                  <TableHead className="text-white/70">Data</TableHead>
                  <TableHead className="text-white/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => toggleTaskStatus(task)}
                      >
                        {task.status === "concluído" ? (
                          <CheckCircle size={18} className="text-green-500" />
                        ) : (
                          <Circle size={18} className="text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      <div>
                        <span className={task.status === "concluído" ? "line-through text-white/60" : ""}>
                          {task.nome}
                        </span>
                        <p className="text-sm text-white/60 truncate max-w-xs">{task.descricao}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80">{task.colaboradorNome}</TableCell>
                    <TableCell className="text-white/80">
                      {new Date(task.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditTaskDialog(task)}
                        >
                          <Edit size={16} className="text-blue-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      
      {/* Task Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#222642] text-white border-0 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-white/80 mb-1">
                Nome da Tarefa
              </label>
              <Input
                id="nome"
                className="bg-white/5 border-white/20 text-white"
                placeholder="Digite o nome da tarefa"
                {...register("nome", { required: "Nome da tarefa é obrigatório" })}
              />
              {errors.nome && (
                <p className="text-red-400 text-sm mt-1">{errors.nome.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-white/80 mb-1">
                Descrição
              </label>
              <Textarea
                id="descricao"
                className="bg-white/5 border-white/20 text-white resize-none min-h-[80px]"
                placeholder="Digite uma descrição"
                {...register("descricao")}
              />
            </div>
            
            <div>
              <label htmlFor="colaborador" className="block text-sm font-medium text-white/80 mb-1">
                Colaborador Responsável
              </label>
              <select
                id="colaborador"
                className="w-full rounded-md bg-white/5 border-white/20 text-white h-10 px-3"
                {...register("colaborador_id", { required: "Selecione um colaborador" })}
              >
                <option value="" disabled>Selecione um colaborador</option>
                {colaboradores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {errors.colaborador_id && (
                <p className="text-red-400 text-sm mt-1">{errors.colaborador_id.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-white/80 mb-1">
                  Data
                </label>
                <Input
                  id="data"
                  type="date"
                  className="bg-white/5 border-white/20 text-white"
                  {...register("data", { required: "Data é obrigatória" })}
                />
                {errors.data && (
                  <p className="text-red-400 text-sm mt-1">{errors.data.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white/80 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full rounded-md bg-white/5 border-white/20 text-white h-10 px-3"
                  {...register("status")}
                >
                  <option value="pendente">Pendente</option>
                  <option value="concluído">Concluído</option>
                </select>
              </div>
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
                {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TasksPage;
