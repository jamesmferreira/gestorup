import React from 'react';
import { User } from 'lucide-react';

const DailyTasksPage = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tarefas Diárias</h1>
        <p className="text-gray-600">Gerencie suas tarefas do dia</p>
      </header>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Minhas Tarefas</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Revisar relatórios de vendas</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Em progresso</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Analisar os relatórios de vendas do último trimestre</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">Prazo: Hoje, 17:00</span>
              <button className="text-sm text-blue-600 hover:text-blue-800">Concluir</button>
            </div>
          </div>
          
          <div className="border rounded-md p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Reunião com equipe de marketing</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Concluído</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Discutir estratégias para o próximo mês</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">Concluído às 10:30</span>
              <button className="text-sm text-gray-600 hover:text-gray-800">Reabrir</button>
            </div>
          </div>
          
          <div className="border rounded-md p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Preparar apresentação para clientes</h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Pendente</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Criar slides para apresentação de novos produtos</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">Prazo: Amanhã, 12:00</span>
              <button className="text-sm text-blue-600 hover:text-blue-800">Iniciar</button>
            </div>
          </div>
        </div>
        
        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Adicionar Nova Tarefa
        </button>
      </div>
    </div>
  );
};

export default DailyTasksPage;
