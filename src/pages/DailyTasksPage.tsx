
import React, { useEffect, useState } from 'react';
import { User, Calendar, Plus, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Task, TaskRecord } from '@/types/task';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import AppLayout from '@/components/AppLayout';

// Importing the Calendar component
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const DailyTasksPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';
  const isGestor = userProfile?.role === 'gestor';
  const canCreateTasks = isAdmin || isGestor;

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        setFormattedDate(dateString);
        
        let tasksQuery;
        
        if (isAdmin || isGestor) {
          // Admins and Gestores see all tasks for the day
          tasksQuery = query(
            collection(db, 'tasks'),
            where('date', '==', dateString)
          );
        } else {
          // Vendedores see only their assigned tasks
          tasksQuery = query(
            collection(db, 'tasks'),
            where('date', '==', dateString),
            where('assignedTo', '==', currentUser.uid)
          );
        }
        
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData: Task[] = [];
        
        tasksSnapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() } as Task);
        });
        
        // For each task, check if there's a record for today
        const tasksWithStatus = await Promise.all(
          tasksData.map(async (task) => {
            const recordRef = query(
              collection(db, 'taskRecords'),
              where('taskId', '==', task.id),
              where('date', '==', dateString),
              where('userId', '==', currentUser.uid)
            );
            
            const recordSnap = await getDocs(recordRef);
            if (!recordSnap.empty) {
              const recordData = recordSnap.docs[0].data();
              return { 
                ...task, 
                status: recordData.status,
                completedAt: recordData.completedAt
              };
            }
            return task;
          })
        );
        
        setTasks(tasksWithStatus);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Erro ao carregar tarefas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser, selectedDate, isAdmin, isGestor]);

  const handleCreateTask = async () => {
    try {
      if (!currentUser || !userProfile) return;
      if (!canCreateTasks) {
        toast.error('Você não tem permissão para criar tarefas');
        return;
      }
      
      if (!newTask.title.trim()) {
        toast.error('O título da tarefa é obrigatório');
        return;
      }
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const taskData: Omit<Task, 'id'> = {
        title: newTask.title,
        description: newTask.description,
        status: 'pendente',
        date: dateString,
        createdBy: currentUser.uid,
        createdAt: Date.now(),
      };
      
      if (newTask.deadline) {
        taskData.deadline = new Date(newTask.deadline);
      }
      
      const taskRef = await addDoc(collection(db, 'tasks'), taskData);
      
      toast.success('Tarefa criada com sucesso!');
      setNewTask({ title: '', description: '', deadline: '' });
      setIsNewTaskDialogOpen(false);
      
      // Add the new task to the list
      setTasks([...tasks, { id: taskRef.id, ...taskData }]);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: 'pendente' | 'em_progresso' | 'concluido') => {
    try {
      if (!currentUser || !userProfile) return;
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const userId = currentUser.uid;
      
      // Check if record exists
      const recordQuery = query(
        collection(db, 'taskRecords'),
        where('taskId', '==', task.id),
        where('date', '==', dateString),
        where('userId', '==', userId)
      );
      
      const recordSnapshot = await getDocs(recordQuery);
      const completedAt = newStatus === 'concluido' ? Date.now() : undefined;
      
      if (recordSnapshot.empty) {
        // Create new record
        await addDoc(collection(db, 'taskRecords'), {
          taskId: task.id,
          userId: userId,
          userName: userProfile.name,
          date: dateString,
          status: newStatus,
          completedAt,
          updatedAt: Date.now()
        });
      } else {
        // Update existing record
        const recordId = recordSnapshot.docs[0].id;
        await updateDoc(doc(db, 'taskRecords', recordId), {
          status: newStatus,
          completedAt,
          updatedAt: Date.now()
        });
      }
      
      // Update task in local state
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus, completedAt } : t
      ));
      
      toast.success(`Status da tarefa atualizado para ${newStatus === 'pendente' ? 'Pendente' : newStatus === 'em_progresso' ? 'Em progresso' : 'Concluído'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tarefas Diárias</h1>
              <p className="text-gray-600">Gerencie suas tarefas do dia</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{format(selectedDate, 'dd/MM/yyyy')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {canCreateTasks && (
                <Button
                  onClick={() => setIsNewTaskDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-1 h-4 w-4" /> Nova Tarefa
                </Button>
              )}
            </div>
          </div>
        </header>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">
              {isAdmin || isGestor ? 'Todas as Tarefas' : 'Minhas Tarefas'} - {format(selectedDate, 'dd/MM/yyyy')}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center">Carregando tarefas...</div>
          ) : tasks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma tarefa para este dia. {canCreateTasks && 'Crie uma nova tarefa para começar.'}
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-md p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      task.status === 'pendente' ? 'bg-red-100 text-red-800' : 
                      task.status === 'em_progresso' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    )}>
                      {task.status === 'pendente' ? 'Pendente' : 
                       task.status === 'em_progresso' ? 'Em progresso' : 
                       'Concluído'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {task.deadline ? `Prazo: ${format(new Date(task.deadline), 'dd/MM/yyyy, HH:mm')}` : 
                       task.status === 'concluido' && task.completedAt ? `Concluído em: ${format(new Date(task.completedAt), 'dd/MM/yyyy, HH:mm')}` : ''}
                    </span>
                    
                    <div className="flex space-x-2">
                      {task.status !== 'pendente' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleStatusChange(task, 'pendente')}
                        >
                          Pendente
                        </Button>
                      )}
                      
                      {task.status !== 'em_progresso' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          onClick={() => handleStatusChange(task, 'em_progresso')}
                        >
                          Em Progresso
                        </Button>
                      )}
                      
                      {task.status !== 'concluido' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleStatusChange(task, 'concluido')}
                        >
                          <Check className="w-4 h-4 mr-1" /> Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Task Dialog */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título *
              </label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Título da tarefa"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Descrição detalhada da tarefa"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                Prazo (opcional)
              </label>
              <Input
                id="deadline"
                type="datetime-local"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTask}>Criar Tarefa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default DailyTasksPage;
