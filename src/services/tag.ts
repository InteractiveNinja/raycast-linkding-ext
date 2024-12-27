import axios from "axios";
import { createAxiosAgentConfig } from "./index";
import { LinkdingAccount } from "../types/index";
import { showErrorToast } from "../utils/index";

interface GetTagsResponse {
  count: number;
  results: Array<{ name: string; }>;
}

export function getTags(linkdingAccount: LinkdingAccount) {
  return axios
    .get<GetTagsResponse>(`${linkdingAccount.serverUrl}/api/tags/`, {
      ...createAxiosAgentConfig(linkdingAccount),
    })
    .then(response => response.data.results.map(tag => tag.name))
    .catch(showErrorToast);
}