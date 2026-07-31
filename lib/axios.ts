import axios from "axios";


export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Surface a clean error message from any Axios error, since API routes
// respond with { error: string } on failure.
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? err.message ?? "Something went wrong";
  }
  return "Something went wrong";
}
