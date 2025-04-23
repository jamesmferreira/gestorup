
import React, { useEffect, useState } from 'react';
import { User, Calendar, Plus, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import AppLayout from '@/components/AppLayout';
import { Task } from '@/types/task';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const DailyTasksPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [tasks, setTasks] = useState<(Task & { status?: 'pendente' | 'em_progresso' | 'concluido', completed_at?: number })[]>([]);
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
        
        let query;
        
        if (isAdmin) {
          // Admins see all tasks
          query = supabase
            .from('tasks')
            .select('*')
            .eq('date', dateString);
        } else if (isGestor) {
          // Gestors see tasks they created or where they are managers
          query = supabase
            .from('tasks')
            .select('*')
            .eq('date', dateString)
            .or(`created_by.eq.${currentUser.id},manager_id.eq.${currentUser.id}`);
        } else {
          // Vendedores see only their assigned tasks
          query = supabase
            .from('tasks')
            .select('*')
            .eq('date', dateString)
            .eq('assigned_to', currentUser.id);
        }
        
        const { data: tasksData, error: tasksError } = await query;
        
        if (tasksError) throw tasksError;
        
        // For each task, check if there's a record for today for the current user
        const tasksWithStatus = await Promise.all(
          (tasksData || []).map(async (task: Task) => {
            const { data: recordData, error: recordError } = await supabase
              .from('task_records')
              .select('*')
              .eq('task_id', task.id)
              .eq('date', dateString)
              .eq('user_id', currentUser.id)
              .single();
            
            if (recordError && recordError.code !== 'PGRST116') {
              console.error('Error fetching task record:', recordError);
            }
            
            if (recordData) {
              return { 
                ...task, 
                status: recordData.status,
                completed_at: recordData.completed_at
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

    if (currentUser && userProfile) {
      fetchTasks();
    }
  }, [currentUser, selectedDate, isAdmin, isGestor, userProfile]);

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
      
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: 'pendente',
        date: dateString,
        created_by: currentUser.id,
        created_at: Date.now(),
        manager_id: userProfile.role === 'gestor' ? currentUser.id : null
      };
      
      if (newTask.deadline) {
        taskData.deadline = new Date(newTask.deadline).toISOString();
      }
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();
      
      if (taskError) throw taskError;
      
      toast.success('Tarefa criada com sucesso!');
      setNewTask({ title: '', description: '', deadline: '' });
      setIsNewTaskDialogOpen(false);
      
      // Add the new task to the list
      setTasks([...tasks, taskData]);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleStatusChange = async (task: Task, newStatus: 'pendente' | 'em_progresso' | 'concluido') => {
    try {
      if (!currentUser || !userProfile) return;
      
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const userId = currentUser.id;
      
      // Check if record exists
      const { data: existingRecord, error: recordError } = await supabase
        .from('task_records')
        .select('*')
        .eq('task_id', task.id)
        .eq('date', dateString)
        .eq('user_id', userId)
        .single();
      
      const completedAt = newStatus === 'concluido' ? Date.now() : null;
      
      if (recordError && recordError.code === 'PGRST116') {
        // Record doesn't exist, create it
        const { error: insertError } = await supabase
          .from('task_records')
          .insert({
            task_id: task.id,
            user_id: userId,
            date: dateString,
            status: newStatus,
            completed_at: completedAt,
            notes: ''
          });
          
        if (insertError) throw insertError;
      } else if (!recordError) {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('task_records')
          .update({
            status: newStatus,
            completed_at: completedAt
          })
          .eq('id', existingRecord.id);
          
        if (updateError) throw updateError;
      } else {
        throw recordError;
      }
      
      // Update task in local state
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt } : t
      ));
      
      toast.success(`Status da tarefa atualizado para ${
        newStatus === 'pendente' ? 'Pendente' : 
        newStatus === 'em_progresso' ? 'Em progresso' : 'Concluído'
      }`);
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
              {isAdmin ? 'Todas as Tarefas' : isGestor ? 'Tarefas da Equipe' : 'Minhas Tarefas'} - {format(selectedDate, 'dd/MM/yyyy')}
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
                       task.status === 'concluido' && task.completed_at ? `Concluído em: ${format(new Date(task.completed_at), 'dd/MM/yyyy, HH:mm')}` : ''}
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
