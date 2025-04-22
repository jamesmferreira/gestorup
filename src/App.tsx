import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TeamPage from "./pages/TeamPage";
import TeamReportPage from "./pages/TeamReportPage";
import DailyTasksPage from "./pages/DailyTasksPage";
import NotFound from "./pages/NotFound";
import VendorReportPage from "./pages/VendorReportPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/equipe" element={<TeamPage />} />
          <Route path="/relatorio-equipe" element={<TeamReportPage />} />
          <Route path="/relatorio-vendedor/:nome" element={<VendorReportPage />} />
          <Route path="/tarefas-diarias" element={<DailyTasksPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
