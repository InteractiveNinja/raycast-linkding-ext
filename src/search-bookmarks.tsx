import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import axios, { CancelTokenSource } from "axios";
import { Agent } from "https";
import { LinkdingBookmark, LinkdingForm, LinkdingMap, LinkdingResponse } from "./types/linkding-types";
import { getLinkdingAccounts } from "./manage-account";

export default function searchLinkding() {
  const [getSelectedLinkdingAccount, setSelectedLinkdingAccount] = useState<LinkdingForm | null>(null);
  const [getLinkdingMap, setLinkdingMap] = useState<LinkdingMap>({});
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<LinkdingBookmark[]>([]);
  const cancelRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    getLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        setLinkdingMap(linkdingMap);
      }
    });
  }, [setLinkdingMap]);

  function fetchBookmarks(searchText: string, linkdingAccount: LinkdingForm | null) {
    if (linkdingAccount) {
      cancelRef.current?.cancel();
      cancelRef.current = axios.CancelToken.source();
      setLoading(true);
      axios<LinkdingResponse>(`${linkdingAccount.serverUrl}/api/bookmarks?` + new URLSearchParams({ q: searchText }), {
        cancelToken: cancelRef.current?.token,
        responseType: "json",
        httpsAgent: new Agent({ rejectUnauthorized: !linkdingAccount.ignoreSSL }),
        headers: { Authorization: `Token ${linkdingAccount.apiKey}` },
      })
        .then((data) => {
          setData(data.data.results);
        })
        .catch((err) => {
          showToast({
            style: Toast.Style.Failure,
            title: "Something went wrong",
            message: err.message,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  function LinkdingAccountDropdown() {
    function setSelectedAccount(name: string): void {
      const linkdingAccount = { name, ...getLinkdingMap[name] };
      setSelectedLinkdingAccount(linkdingAccount);
      fetchBookmarks("", linkdingAccount);
    }

    return (
      <List.Dropdown tooltip="User Account" onChange={(name) => setSelectedAccount(name)} throttle storeValue>
        {Object.keys(getLinkdingMap).map((name) => (
          <List.Dropdown.Item key={name} title={name} value={name} />
        ))}
      </List.Dropdown>
    );
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={(searchText) => fetchBookmarks(searchText, getSelectedLinkdingAccount)}
      searchBarPlaceholder="Search bookmarks..."
      searchBarAccessory={<LinkdingAccountDropdown />}
      throttle
    >
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((linkdingBookmark) => (
          <SearchListItem key={linkdingBookmark.id} linkdingBookmark={linkdingBookmark} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ linkdingBookmark }: { linkdingBookmark: LinkdingBookmark }) {
  return (
    <List.Item
      title={
        linkdingBookmark.title.length > 0
          ? linkdingBookmark.title
          : linkdingBookmark.website_title ?? linkdingBookmark.url
      }
      subtitle={
        linkdingBookmark.description.length > 0 ? linkdingBookmark.description : linkdingBookmark.website_description
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={linkdingBookmark.url} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
