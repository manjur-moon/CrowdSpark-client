import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./lib/AuthContext";
import { ThemeProvider, useTheme } from "./lib/ThemeContext";
import { AppErrorBoundary } from "./components/errors/AppErrorBoundary";
import { RouteScrollManager } from "./components/navigation/RouteScrollManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false }
  }
});

function AppToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors position="top-right" theme={resolvedTheme} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <RouteScrollManager />
            <AuthProvider>
              <App />
              <AppToaster />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
