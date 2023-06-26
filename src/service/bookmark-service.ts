import axios, { AxiosRequestConfig } from "axios";
import { LinkdingBookmarkPayload, LinkdingResponse, LinkdingServer, WebsiteMetadata } from "../types/linkding-types";
import { Agent } from "https";
import { showErrorToast } from "../util/bookmark-util";
import { load } from "cheerio";

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

export function createBookmark(linkdingAccount: LinkdingServer, bookmark: LinkdingBookmarkPayload) {
  return axios
    .post(`${linkdingAccount.serverUrl}/api/bookmarks/`, bookmark, {
      ...createAxiosAgentConfig(linkdingAccount),
    })
    .catch(showErrorToast);
}

export function getWebsiteMetadata(url: string): Promise<WebsiteMetadata | void> {
  return axios
    .get(url)
    .then((response) => {
      const $ = load(response.data);
      const title = $("title").text().trim();
      const description = $("meta[name='description']").attr("content")?.trim();
      return { title, description };
    })
    .catch(showErrorToast);
}
