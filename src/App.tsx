import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import PhoneSimulator from "./pages/PhoneSimulator";
import Demos from "./pages/Demos";
import DemoViewer from "./pages/DemoViewer";
import WebhookLogs from "./pages/WebhookLogs";
import ArchivedFlows from "./pages/ArchivedFlows";
import GlobalsPage from "./pages/GlobalsPage";
import StartsPage from "./pages/StartsPage";
import ExportPage from "./pages/ExportPage";
import ImportPage from "./pages/ImportPage";
import ValidatePage from "./pages/ValidatePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/archived" element={<ArchivedFlows />} />
            <Route path="/globals" element={<GlobalsPage />} />
            <Route path="/starts" element={<StartsPage />} />
            <Route path="/webhooks" element={<WebhookLogs />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/validate" element={<ValidatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/simulator" element={<PhoneSimulator />} />
            <Route path="/demos" element={<Demos />} />
            <Route path="/demo/:id" element={<DemoViewer />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
