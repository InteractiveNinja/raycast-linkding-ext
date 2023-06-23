import axios, { AxiosError } from "axios";
import { showToast, Toast } from "@raycast/api";

export function showErrorToast(err: Error | AxiosError) {
  if (!axios.isCancel(err)) {
    showToast({
      style: Toast.Style.Failure,
      title: "Something went wrong",
      message: err.message,
    });
  }
}
