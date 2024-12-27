import { AxiosRequestConfig } from "axios";
import { LinkdingAccount } from "../types/index";
import { Agent } from "https";

export function createAxiosAgentConfig(linkdingAccount: LinkdingAccount): AxiosRequestConfig {
  return {
    responseType: "json",
    httpsAgent: new Agent({ rejectUnauthorized: !linkdingAccount.ignoreSSL }),
    headers: { Authorization: `Token ${linkdingAccount.apiKey}` },
  };
}