import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import AuthGuard from "./components/AuthGuard";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import FlowDashboard from "./pages/FlowDashboard";
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
import JourneysPage from "./pages/JourneysPage";
import ProductionPage from "./pages/ProductionPage";
import LibraryPage from "./pages/LibraryPage";
import TemplatesPage from "./pages/TemplatesPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import WhatsAppTestPage from "./pages/WhatsAppTestPage";
import TenantsPage from "./pages/TenantsPage";
import ExperienceStudioPage from "./pages/ExperienceStudioPage";
import ShareDemo from "./pages/ShareDemo";
import DemoDomainRoot, { isDemoDomain } from "./components/DemoDomainGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // If served from the demo subdomain, show only the demo
  if (isDemoDomain()) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DemoDomainRoot />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkspaceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/share/:id" element={<ShareDemo />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
              {/* Principal */}
              <Route path="/" element={<HomePage />} />
              <Route path="/journeys" element={<JourneysPage />} />
              <Route path="/studio" element={<ExperienceStudioPage />} />
              <Route path="/simulator" element={<PhoneSimulator />} />
              <Route path="/editor" element={<Index />} />
              <Route path="/production" element={<ProductionPage />} />
              {/* Assets & Resources */}
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/demos" element={<Demos />} />
              <Route path="/demo/:id" element={<DemoViewer />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/import" element={<ImportPage />} />
              {/* Infrastructure */}
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/whatsapp" element={<WhatsAppTestPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Advanced Tools */}
              <Route path="/flows" element={<FlowDashboard />} />
              <Route path="/archived" element={<ArchivedFlows />} />
              <Route path="/globals" element={<GlobalsPage />} />
              <Route path="/starts" element={<StartsPage />} />
              <Route path="/webhooks" element={<WebhookLogs />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/validate" element={<ValidatePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
