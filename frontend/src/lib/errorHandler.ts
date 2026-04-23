import { useToast } from "@/hooks/use-toast";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, fallbackMessage: string = "Something went wrong") => {
    const message = getErrorMessage(error) || fallbackMessage;
    console.error("Error:", error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    return message;
  };

  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    });
  };

  return { handleError, handleSuccess };
}

// API Error Handler
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorData: unknown;

    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    } else {
      errorData = await response.text();
    }

    const error: ApiError = {
      status: response.status,
      message:
        (errorData as any)?.message ||
        (typeof errorData === "string" ? errorData : response.statusText),
      code: (errorData as any)?.code,
      details: errorData,
    };

    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text() as T;
}

// Validation Error Handler
export function getValidationErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as any).issues;
    if (Array.isArray(issues)) {
      issues.forEach((issue) => {
        const path = issue.path?.join(".") || "general";
        errors[path] = issue.message;
      });
    }
  }

  return errors;
}
