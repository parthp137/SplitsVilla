import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Component that throws error
const ErrorThrowingComponent = () => {
  throw new Error("Test error");
};

// Component that renders normally
const SafeComponent = () => <div>Safe content here</div>;

describe("ErrorBoundary Snapshot", () => {
  it("renders children when no error occurs", () => {
    const { container } = render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });

  it("shows error UI when child throws", () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const { container } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(container).toMatchSnapshot();
    consoleErrorSpy.mockRestore();
  });

  it("displays error details in development", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    try {
      const { container } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
      expect(container).toMatchSnapshot();
    } finally {
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    }
  });

  it("renders multiple children correctly", () => {
    const { container } = render(
      <ErrorBoundary>
        <div>First child</div>
        <div>Second child</div>
        <div>Third child</div>
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders nested components correctly", () => {
    const { container } = render(
      <ErrorBoundary>
        <div className="container">
          <header>
            <h1>Test App</h1>
          </header>
          <main>
            <SafeComponent />
          </main>
        </div>
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });
});
