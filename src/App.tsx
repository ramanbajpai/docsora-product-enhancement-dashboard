import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import AICheck from "./pages/AICheck";
import Compress from "./pages/Compress";
import Convert from "./pages/Convert";
import Storage from "./pages/Storage";
import Track from "./pages/Track";
import Translate from "./pages/Translate";
import Transfer from "./pages/Transfer";
import Tools from "./pages/Tools";
import Tool from "./pages/Tool";
import Sign from "./pages/Sign";
import DocumentViewer from "./pages/DocumentViewer";
import SignedDocumentViewerPage from "./pages/SignedDocumentViewerPage";
import NotFound from "./pages/NotFound";
import SignReceived from "./pages/SignReceived";
import SignerSetup from "./pages/SignerSetup";
import ApproveReceived from "./pages/ApproveReceived";
import Profile from "./pages/settings/Profile";
import Account from "./pages/settings/Account";
import Workspace from "./pages/settings/Workspace";
import Billing from "./pages/settings/Billing";
import Security from "./pages/settings/Security";
import Notifications from "./pages/settings/Notifications";
import Help from "./pages/settings/Help";
import AuditLogs from "./pages/settings/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ai-check" element={<AICheck />} />
            <Route path="/compress" element={<Compress />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/track" element={<Track />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/:toolId" element={<Tool />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/document-viewer" element={<DocumentViewer />} />
            <Route path="/signed-document-viewer" element={<SignedDocumentViewerPage />} />
            <Route path="/sign/received/:requestId/setup" element={<SignerSetup />} />
            <Route path="/sign/received/:requestId" element={<SignReceived />} />
            <Route path="/approve/received/:requestId" element={<ApproveReceived />} />
            <Route path="/settings/profile" element={<Profile />} />
            <Route path="/settings/account" element={<Account />} />
            <Route path="/settings/workspace" element={<Workspace />} />
            <Route path="/settings/billing" element={<Billing />} />
            <Route path="/settings/security" element={<Security />} />
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/settings/help" element={<Help />} />
            <Route path="/settings/audit-logs" element={<AuditLogs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
