import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Hostels from "./pages/Hostels";
import Rooms from "./pages/Rooms";
import Allocations from "./pages/Allocations";
import ServiceRequests from "./pages/ServiceRequests";
import WaitingList from "./pages/WaitingList";
import MyRoom from "./pages/MyRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/hostels" element={<Hostels />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/allocations" element={<Allocations />} />
        <Route path="/service-requests" element={<ServiceRequests />} />
        <Route path="/waiting-list" element={<WaitingList />} />
        <Route path="/my-room" element={<MyRoom />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
