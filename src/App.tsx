import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import WeaponsPlatforms from "./pages/WeaponsPlatforms";
import ExportData from "./pages/ExportData";
import ContactDetail from "./pages/ContactDetail";
import PointsOfContact from "./pages/PointsOfContact";
import NotFound from "./pages/NotFound";
import { ThemeToggle } from "@/components/ThemeToggle";
import WeaponPlatformDetail from "./pages/WeaponPlatformDetail";
import AwardWatchlist from "./pages/AwardWatchlist";
import AwardSearch from "./pages/AwardSearch";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/Eagle-Sight/">
        <SidebarProvider defaultOpen={true}>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4">
                <SidebarTrigger />
                <ThemeToggle />
              </header>

              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/platforms" element={<WeaponsPlatforms />} />
                  <Route path="/platforms/:id" element={<WeaponPlatformDetail />} />
                  <Route path="/awards" element={<AwardSearch/>} />
                  <Route path="/export" element={<ExportData />} />
                  <Route path="/AwardWatchlist" element={<AwardWatchlist />} />  
                  <Route path="/points-of-contact" element={<PointsOfContact />} />
                  <Route path="/points-of-contact/:email" element={<ContactDetail />} />
                  <Route path="/contacts/:email" element={<ContactDetail />} />
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