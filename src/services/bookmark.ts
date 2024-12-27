import axios from "axios";
import { createAxiosAgentConfig } from "./index";
import { GetLinkdingBookmarkResponse, LinkdingAccount, PostLinkdingBookmarkPayload } from "../types/index";
import { showErrorToast } from "../utils/index";
import { load } from "cheerio";

export function searchBookmarks(
  linkdingAccount: LinkdingAccount,
  searchText: string,
  abortControllerRef: React.MutableRefObject<AbortController | null>
) {
  return axios<GetLinkdingBookmarkResponse>(
    `${linkdingAccount.serverUrl}/api/bookmarks?` + new URLSearchParams({ q: searchText }),
    {
      signal: abortControllerRef.current?.signal,
      ...createAxiosAgentConfig(linkdingAccount),
    }
  );
}

export function deleteBookmark(linkdingAccount: LinkdingAccount, bookmarkId: number) {
  return axios
    .delete(`${linkdingAccount.serverUrl}/api/bookmarks/${bookmarkId}`, {
      ...createAxiosAgentConfig(linkdingAccount),
    })
    .catch(showErrorToast);
}

export function createBookmark(linkdingAccount: LinkdingAccount, bookmark: PostLinkdingBookmarkPayload) {
  return axios
    .post(`${linkdingAccount.serverUrl}/api/bookmarks/`, bookmark, {
      ...createAxiosAgentConfig(linkdingAccount),
    })
    .catch(showErrorToast);
}

export function updateBookmark(
  linkdingAccount: LinkdingAccount,
  bookmarkId: number,
  data: { title: string; notes: string; tag_names: string[] }
) {
  return axios
    .patch(`${linkdingAccount.serverUrl}/api/bookmarks/${bookmarkId}/`, data, {
      ...createAxiosAgentConfig(linkdingAccount),
    })
    .catch(showErrorToast);
}

export function getWebsiteMetadata(url: string) {
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
