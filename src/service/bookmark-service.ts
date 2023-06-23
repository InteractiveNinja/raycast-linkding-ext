import axios, { AxiosError } from "axios";
import { showToast, Toast } from "@raycast/api";
import { LinkdingResponse, LinkdingServer } from "../types/linkding-types";
import { Agent } from "https";

export function showErrorToast(err: Error | AxiosError) {
  if (!axios.isCancel(err)) {
    showToast({
      style: Toast.Style.Failure,
      title: "Something went wrong",
      message: err.message,
    });
  }
}

export function searchBookmarks(
  linkdingAccount: LinkdingServer,
  searchText: string,
  abortControllerRef: React.MutableRefObject<AbortController | null>
) {
  return axios<LinkdingResponse>(
    `${linkdingAccount.serverUrl}/api/bookmarks?` + new URLSearchParams({ q: searchText }),
    {
      signal: abortControllerRef.current?.signal,
      responseType: "json",
      httpsAgent: new Agent({ rejectUnauthorized: !linkdingAccount.ignoreSSL }),
      headers: { Authorization: `Token ${linkdingAccount.apiKey}` },
    }
  );
}
