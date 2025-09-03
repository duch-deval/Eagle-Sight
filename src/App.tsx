import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import WeaponsPlatforms from "./pages/WeaponsPlatforms";
import ContractSearch from "./pages/ContractSearch";
import Contractors from "./pages/Contractors";
import MarketIntelligence from "./pages/MarketIntelligence";
import Opportunities from "./pages/Opportunities";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4">
                <SidebarTrigger />
                <div className="ml-4">
                  <h1 className="text-lg font-semibold">Defense Funding Analyzer</h1>
                </div>
              </header>
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/platforms" element={<WeaponsPlatforms />} />
                  <Route path="/contracts" element={<ContractSearch />} />
                  <Route path="/contractors" element={<Contractors />} />
                  <Route path="/intelligence" element={<MarketIntelligence />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;