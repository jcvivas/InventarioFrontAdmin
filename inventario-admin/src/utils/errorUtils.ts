import type { AxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback = "Error no vale esta wbda."): string {
  const ax = err as AxiosError<any>;
  const msg =
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    ax?.message;

  return typeof msg === "string" && msg.trim().length > 0 ? msg : fallback;
}
