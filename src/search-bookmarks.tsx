import { Action, ActionPanel, Icon, Image, List, getPreferenceValues, useNavigation } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { LinkdingAccount, LinkdingAccountForm, LinkdingAccountMap, LinkdingBookmark, Preferences } from "./types/linkding-types";

import { getPersistedLinkdingAccounts } from "./service/user-account-service";
import { deleteBookmark, searchBookmarks, updateBookmark } from "./service/bookmark-service";
import { showErrorToast, showSuccessToast } from "./util/bookmark-util";
import { LinkdingShortcut } from "./types/linkding-shortcuts";
import { EditBookmarkForm } from "./components/EditBookmarkForm";

export default function searchLinkding() {
  const [selectedLinkdingAccount, setSelectedLinkdingAccount] = useState<LinkdingAccountForm | LinkdingAccount | null>(
    null
  );
  const [linkdingAccountMap, setLinkdingAccountMap] = useState<LinkdingAccountMap>({});
  const [isLoading, setLoading] = useState(true);
  const [hasLinkdingAccounts, setHasLindingAccounts] = useState(false);
  const [linkdingBookmarks, setLinkdingBookmarks] = useState<LinkdingBookmark[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getPersistedLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        setLinkdingAccountMap(linkdingMap);
        setHasLindingAccounts(Object.keys(linkdingMap).length > 0);
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
      deleteBookmark(selectedLinkdingAccount, bookmarkId).then(() => {
        showSuccessToast("Bookmark deleted");
        fetchBookmarks(searchText, selectedLinkdingAccount);
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
            <SearchListItem
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
          title="You dont have a Linkding Account"
          description="Please create a linking account before searching for bookmarks."
        />
      </List>
    );
  }
}

function SearchListItem({
  linkdingBookmark,
  deleteBookmarkCallback,
  selectedLinkdingAccount,
  onBookmarkUpdated,
}: {
  linkdingBookmark: LinkdingBookmark;
  deleteBookmarkCallback: (bookmarkId: number) => void;
  selectedLinkdingAccount: LinkdingAccount;
  onBookmarkUpdated: () => void;
}) {
  const preferences = getPreferenceValues<Preferences>();
  const { push } = useNavigation();
  
  function showCopyToast() {
    showSuccessToast("Copied to Clipboard");
  }

  async function handleEditBookmark(title: string, notes: string, tagNames: string[]) {
    if (selectedLinkdingAccount) {
      await updateBookmark(selectedLinkdingAccount, linkdingBookmark.id, { 
        title, 
        notes, 
        tag_names: tagNames 
      });
      onBookmarkUpdated();
    }
  }

  function showEditForm() {
    push(<EditBookmarkForm 
      bookmark={linkdingBookmark} 
      selectedAccount={selectedLinkdingAccount} 
      onSubmit={handleEditBookmark} 
    />);
  }

  return (
    <List.Item
      title={
        linkdingBookmark.title.length > 0
          ? linkdingBookmark.title
          : linkdingBookmark.website_title ?? linkdingBookmark.url
      }
      subtitle={
        preferences.showSubtitle
          ? (preferences.subtitleSource === "description"
              ? (linkdingBookmark.description && linkdingBookmark.description.length > 0
                  ? linkdingBookmark.description
                  : linkdingBookmark.website_description)
              : linkdingBookmark.notes)
          : undefined
      }
      icon={preferences.showFavicon ? {source:linkdingBookmark.favicon_url, mask: Image.Mask.Circle} : undefined}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser url={linkdingBookmark.url} />
            <Action.CopyToClipboard
              content={linkdingBookmark.url}
              onCopy={showCopyToast}
              shortcut={LinkdingShortcut.COPY_SHORTCUT}
            />
            <Action
              title="Edit Bookmark"
              icon={{ source: Icon.Pencil }}
              shortcut={LinkdingShortcut.EDIT_SHORTCUT}
              onAction={showEditForm}
            />
            <Action
              onAction={() => deleteBookmarkCallback(linkdingBookmark.id)}
              icon={{ source: Icon.Trash }}
              title="Delete"
              shortcut={LinkdingShortcut.DELETE_SHORTCUT}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
