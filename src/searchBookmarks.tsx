import {
  Action,
  ActionPanel,
  Icon,
  Image,
  List,
  getPreferenceValues,
  useNavigation,
  open,
  confirmAlert,
} from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import {
  LinkdingAccount,
  LinkdingAccountForm,
  LinkdingAccountMap,
  LinkdingBookmark,
  Preferences,
  SubtitleSource,
} from "./types";

import { getPersistedLinkdingAccounts } from "./services/account";
import { deleteBookmark, searchBookmarks, updateBookmark } from "./services/bookmark";
import { showErrorToast, showSuccessToast } from "./utils";
import { LinkdingShortcut } from "./types/shortcuts";
import { EditBookmarkForm } from "./components/EditBookmarkForm";
import _ from "lodash";

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
          title="You don't have a Linkding Account"
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
  selectedLinkdingAccount: LinkdingAccount | null;
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
        tag_names: tagNames,
      });
      onBookmarkUpdated();
    } else {
      showErrorToast(new Error("Please select a Linkding Account"));
    }
  }

  function showEditForm() {
    push(
      <EditBookmarkForm
        bookmark={linkdingBookmark}
        selectedAccount={selectedLinkdingAccount}
        onSubmit={handleEditBookmark}
      />
    );
  }

  function handleOpenInLinkding() {
    if (selectedLinkdingAccount) {
      const baseUrl = selectedLinkdingAccount.serverUrl.replace(/\/$/, "");
      open(`${baseUrl}/bookmarks?details=${linkdingBookmark.id}`);
    } else {
      showErrorToast(new Error("Please select a Linkding Account"));
    }
  }

  function handleEditInLinkding() {
    if (selectedLinkdingAccount) {
      const baseUrl = selectedLinkdingAccount.serverUrl.replace(/\/$/, "");
      open(`${baseUrl}/bookmarks/${linkdingBookmark.id}/edit`);
    } else {
      showErrorToast(new Error("Please select a Linkding Account"));
    }
  }

  function getSubtitle() {
    return preferences.showSubtitle && preferences.subtitleSource === SubtitleSource.DESCRIPTION
      ? getDescription()
      : getNotes();
  }

  function getDescription() {
    return !_.isEmpty(linkdingBookmark.description) ? linkdingBookmark.description : undefined;
  }

  function getNotes() {
    return !_.isEmpty(linkdingBookmark.notes) ? linkdingBookmark.notes : undefined;
  }

  return (
    <List.Item
      title={
        !_.isEmpty(linkdingBookmark.title)
          ? linkdingBookmark.title
          : linkdingBookmark.website_title ?? linkdingBookmark.url
      }
      subtitle={getSubtitle()}
      icon={
        preferences.showFavicon && !_.isNil(linkdingBookmark.favicon_url)
          ? {
              source: linkdingBookmark.favicon_url,
              mask: Image.Mask.Circle,
            }
          : undefined
      }
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
          <ActionPanel.Section>
            <Action
              title="View in Linkding"
              icon={Icon.Eye}
              shortcut={LinkdingShortcut.VIEW_IN_LINKDING_SHORTCUT}
              onAction={handleOpenInLinkding}
            />
            <Action
              title="Edit in Linkding"
              icon={Icon.Link}
              shortcut={LinkdingShortcut.EDIT_IN_LINKDING_SHORTCUT}
              onAction={handleEditInLinkding}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
