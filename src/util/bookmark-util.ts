import axios from "axios";
import { showToast, Toast } from "@raycast/api";

export function showErrorToast(error: any) {
  if (!axios.isCancel(error)) {
    showToast({
      style: Toast.Style.Failure,
      title: "Something went wrong",
      message: error.message,
    });
  }
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
