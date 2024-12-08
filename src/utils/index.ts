import axios, { AxiosError, CanceledError, isAxiosError } from "axios";
import { showToast, Toast } from "@raycast/api";

export function showErrorToast(error: Error | AxiosError) {
  if (axios.isAxiosError(error) && isCancel(error)) {
    return;
  }
  
  showToast({
    style: Toast.Style.Failure,
    title: "Something went wrong",
    message: error.message,
  });
}

export function showSuccessToast(message: string) {
  showToast({
    style: Toast.Style.Success,
    title: "Success",
    message,
  });
}

export function validateUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isCancel(value: AxiosError | CanceledError<never>): boolean {
  return value instanceof CanceledError;
}
