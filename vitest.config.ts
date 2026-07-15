import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    clearMocks: true,
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 20_000,
    hookTimeout: 20_000,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/access-token.ts",
        "src/lib/api.ts",
        "src/hooks/useDebouncedValue.ts",
        "src/components/CampaignCard.tsx",
        "src/components/errors/AppErrorBoundary.tsx",
        "src/components/upload/ImageUploadField.tsx"
      ],
      exclude: ["src/**/*.test.{ts,tsx}", "src/main.tsx"],
      thresholds: { statements: 55, branches: 40, functions: 55, lines: 55 }
    }
  }
});
