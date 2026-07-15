import { Component, type ErrorInfo, type ReactNode } from "react";
import { CircleAlert, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled CrowdSpark rendering error", { error, errorInfo });
  }

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <section className="card w-full max-w-lg p-8 text-center" role="alert">
          <CircleAlert className="mx-auto size-12 text-red-600" />
          <h1 className="mt-5 text-2xl font-black text-slate-950">Something went wrong</h1>
          <p className="mt-3 text-slate-600">
            The application encountered an unexpected rendering error. Reload to start a clean
            session.
          </p>
          <button
            type="button"
            className="btn-primary mt-7"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="size-5" /> Reload application
          </button>
        </section>
      </main>
    );
  }
}
