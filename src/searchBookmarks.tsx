import { confirmAlert, List } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { LinkdingAccount, LinkdingAccountForm, LinkdingAccountMap, LinkdingBookmark } from "./types";

import { getPersistedLinkdingAccounts } from "./services/account";
import { deleteBookmark, searchBookmarks } from "./services/bookmark";
import { showErrorToast, showSuccessToast } from "./utils";
import _ from "lodash";
import { BookmarkListItem } from "./components/BookmarkListItem";

export default function searchLinkding() {
  const [selectedLinkdingAccount, setSelectedLinkdingAccount] = useState<LinkdingAccountForm | LinkdingAccount | null>(
    null
  );
  const [linkdingAccountMap, setLinkdingAccountMap] = useState<LinkdingAccountMap>({});
  const [isLoading, setLoading] = useState(true);
  const [hasLinkdingAccounts, setHasLinkdingAccounts] = useState(false);
  const [linkdingBookmarks, setLinkdingBookmarks] = useState<LinkdingBookmark[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getPersistedLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        setLinkdingAccountMap(linkdingMap);
        setHasLinkdingAccounts(!_.isEmpty(linkdingMap));
      }
    });
  }, [setLinkdingAccountMap]);

  useEffect(() => {
    fetchBookmarks(searchText, selectedLinkdingAccount);
  }, [selectedLinkdingAccount, searchText]);

  function createAbortController(timeoutMs: number) {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), timeoutMs || 0);
    abortControllerRef.current = abortController;
    return abortController;
  }

  function fetchBookmarks(searchText: string, linkdingAccount: LinkdingAccountForm | null) {
    if (linkdingAccount) {
      createAbortController(5000);
      setLoading(true);
      searchBookmarks(linkdingAccount, searchText, abortControllerRef)
        .then((data) => {
          setLinkdingBookmarks(data.data.results);
        })
        .catch(showErrorToast)
        .finally(() => {
          setLoading(false);
        });
    }
  }

  function deleteBookmarkCallback(bookmarkId: number) {
    if (selectedLinkdingAccount) {
      confirmAlert({
        title: "Confirm Delete",
        message: "Are you sure you want to delete this bookmark?",
        primaryAction: {
          title: "Delete",
          onAction: () => {
            deleteBookmark(selectedLinkdingAccount, bookmarkId).then(() => {
              showSuccessToast("Bookmark deleted");
              fetchBookmarks(searchText, selectedLinkdingAccount);
            });
          },
        },
      });
    }
  }

  function LinkdingAccountDropdown() {
    function setSelectedAccount(name: string): void {
      const linkdingAccount = { name, ...linkdingAccountMap[name] };
      setSelectedLinkdingAccount(linkdingAccount);
      fetchBookmarks("", linkdingAccount);
    }

    return (
      <List.Dropdown tooltip="User Account" onChange={(name) => setSelectedAccount(name)} throttle storeValue>
        {Object.keys(linkdingAccountMap).map((name) => (
          <List.Dropdown.Item key={name} title={name} value={name} />
        ))}
      </List.Dropdown>
    );
  }

  if (hasLinkdingAccounts) {
    return (
      <List
        isLoading={isLoading}
        onSearchTextChange={setSearchText}
        searchBarPlaceholder="Search through bookmarks..."
        searchBarAccessory={<LinkdingAccountDropdown />}
        throttle
      >
        <List.Section title="Results" subtitle={linkdingBookmarks?.length + ""}>
          {linkdingBookmarks?.map((linkdingBookmark) => (
            <BookmarkListItem
              key={linkdingBookmark.id}
              linkdingBookmark={linkdingBookmark}
              deleteBookmarkCallback={deleteBookmarkCallback}
              selectedLinkdingAccount={selectedLinkdingAccount}
              onBookmarkUpdated={() => fetchBookmarks(searchText, selectedLinkdingAccount)}
            />
          ))}
        </List.Section>
      </List>
    );
  } else {
    return (
      <List>
        <List.EmptyView
          title="You don't have a Linkding Account"
          description="Please create a linking account before searching for bookmarks."
        />
      </List>
    );
  }
}
