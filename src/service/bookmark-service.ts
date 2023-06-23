import axios, { AxiosRequestConfig } from "axios";
import { LinkdingResponse, LinkdingServer } from "../types/linkding-types";
import { Agent } from "https";
import { showErrorToast } from "../util/bookmark-util";

function createAxiosAgentConfig(linkdingAccount: LinkdingServer): AxiosRequestConfig {
  return {
    responseType: "json",
    httpsAgent: new Agent({ rejectUnauthorized: !linkdingAccount.ignoreSSL }),
    headers: { Authorization: `Token ${linkdingAccount.apiKey}` },
  };
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
      ...createAxiosAgentConfig(linkdingAccount),
    }
  );
}

export function deleteBookmark(linkdingAccount: LinkdingServer, bookmarkId: number) {
  return axios
    .delete(`${linkdingAccount.serverUrl}/api/bookmarks/${bookmarkId}`, {
      ...createAxiosAgentConfig(linkdingAccount),
    })
    .catch(showErrorToast);
}
