
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import { Calendar as CalendarIcon, Download, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { TaskRecord } from '@/types/task';
import { toast } from '@/components/ui/sonner';

const TaskReportsPage = () => {
  const { userProfile } = useAuth();
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  });
  const [hasMore, setHasMore] = useState(true);
  
  const isGestorOrAdmin = userProfile?.role === 'admin' || userProfile?.role === 'gestor';

  useEffect(() => {
    fetchTaskRecords();
  }, [startDate, endDate, userProfile]);

  const fetchTaskRecords = async (loadMore = false) => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      // Updated to remove company_id filtering
      const { data, error } = await supabase
        .from('task_records')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Calculate stats
      const total = data.length;
      const completed = data.filter(r => r.status === 'concluido').length;
      const inProgress = data.filter(r => r.status === 'em_progresso').length;
      const pending = data.filter(r => r.status === 'pendente').length;
      
      setStats({
        total,
        completed,
        inProgress,
        pending,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      });
      
      // Map the raw data to TaskRecord objects
      const mappedRecords: TaskRecord[] = data.map(record => ({
        id: record.id,
        task_id: record.task_id,
        user_id: record.user_id,
        userName: record.user_name || 'Unknown', // Assume we have user_name in records or add it
        date: record.date,
        status: record.status,
        completed_at: record.completed_at,
        notes: record.notes
      }));
      
      setRecords(mappedRecords);
      setHasMore(false);
    } catch (error) {
      console.error('Error fetching task records:', error);
      toast.error('Erro ao carregar registros de tarefas');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRecords = () => {
    fetchTaskRecords(true);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Data', 'Usuário', 'Status', 'Data de Conclusão', 'Notas'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.date,
        record.userName,
        record.status === 'pendente' ? 'Pendente' :
        record.status === 'em_progresso' ? 'Em Progresso' : 'Concluído',
        record.completed_at ? format(new Date(record.completed_at), 'dd/MM/yyyy HH:mm') : '',
        record.notes || ''
      ].join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_tarefas_${format(startDate, 'dd-MM-yyyy')}_a_${format(endDate, 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Relatório de Tarefas</h1>
              <p className="text-gray-600">Visualize e exporte relatórios de desempenho</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      De: {format(startDate, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Até: {format(endDate, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button
                variant="outline"
                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                onClick={exportToCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </header>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-gray-500">
                {stats.completionRate.toFixed(1)}% de conclusão
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Em Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Records Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <BarChart className="w-5 h-5 text-blue-500 mr-2" />
              Histórico de Tarefas
            </h2>
          </div>
          
          {loading && records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Carregando dados...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum registro encontrado para o período selecionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    {isGestorOrAdmin && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conclusão
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.date}
                      </td>
                      {isGestorOrAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.userName}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          record.status === 'pendente' ? 'bg-red-100 text-red-800' : 
                          record.status === 'em_progresso' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        )}>
                          {record.status === 'pendente' ? 'Pendente' : 
                          record.status === 'em_progresso' ? 'Em Progresso' : 
                          'Concluído'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.completed_at ? format(new Date(record.completed_at), 'dd/MM/yyyy HH:mm') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {hasMore && (
            <div className="p-4 text-center">
              <Button 
                variant="outline"
                onClick={loadMoreRecords}
                disabled={loading}
              >
                {loading ? "Carregando..." : "Carregar Mais"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskReportsPage;
