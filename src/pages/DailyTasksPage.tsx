
import React, { useState } from 'react';
import Logo from '@/components/Logo';
import { CheckSquare, Instagram, Video, MessageSquare, Phone, ShoppingCart } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  icon: React.ComponentType;
  completed: boolean;
};

const DailyTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Postagem nos Stories', icon: Instagram, completed: false },
    { id: 2, title: 'Postagem no Feed', icon: Instagram, completed: false },
    { id: 3, title: 'Gravar Conteúdo', icon: Video, completed: false },
    { id: 4, title: 'Prova Social', icon: MessageSquare, completed: false },
    { id: 5, title: 'Revisar Directs e Instagram', icon: Instagram, completed: false },
    { id: 6, title: 'Fazer 15 Contatos', icon: Phone, completed: false },
    { id: 7, title: 'Marketplace', icon: ShoppingCart, completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? {...task, completed: !task.completed} : task
    ));
  };

  const submitReport = () => {
    console.log('Relatório enviado', tasks);
    // Aqui poderia ir a lógica de envio de relatório
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] p-6">
      <header className="flex justify-between items-center mb-12">
        <Logo />
      </header>
      
      <main className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-medium mb-8">
          Suas Tarefas de Hoje
        </h1>
        
        <div className="space-y-4 mb-8">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`
                flex items-center p-4 rounded-xl 
                ${task.completed 
                  ? 'bg-[#22C55E]/20 border border-[#22C55E]/30' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'}
                transition-all duration-300 cursor-pointer
              `}
              onClick={() => toggleTask(task.id)}
            >
              <task.icon 
                size={24} 
                className={task.completed ? 'text-[#22C55E]' : 'text-white/70'}
              />
              <span 
                className={`
                  ml-4 text-lg 
                  ${task.completed ? 'text-[#22C55E] line-through' : 'text-white'}
                `}
              >
                {task.title}
              </span>
              <CheckSquare 
                size={24} 
                className={`ml-auto ${task.completed ? 'text-[#22C55E]' : 'text-white/30'}`} 
              />
            </div>
          ))}
        </div>

        <button 
          onClick={submitReport}
          className="
            w-full bg-[#00F0FF] text-white 
            py-4 rounded-xl font-bold text-lg
            hover:bg-[#00C3FF] transition-colors
            flex items-center justify-center
          "
        >
          ENVIAR RELATÓRIO
        </button>
      </main>
    </div>
  );
};

export default DailyTasksPage;
