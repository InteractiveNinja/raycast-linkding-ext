import { LinkdingAccount, LinkdingBookmark, Preferences, SubtitleSource } from "../types";
import { Action, ActionPanel, getPreferenceValues, Icon, Image, List, open, useNavigation } from "@raycast/api";
import { showErrorToast, showSuccessToast } from "../utils";
import { updateBookmark } from "../services/bookmark";
import { EditBookmarkForm } from "./EditBookmarkForm";
import _ from "lodash";
import { LinkdingShortcut } from "../types/shortcuts";

export function BookmarkListItem({
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
