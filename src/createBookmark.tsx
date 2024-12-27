import { Action, ActionPanel, Form, Icon, popToRoot, useNavigation } from "@raycast/api";
import { LinkdingAccountMap, PostLinkdingBookmarkPayload } from "./types/index";
import { useEffect, useState } from "react";
import { getPersistedLinkdingAccounts } from "./services/account";
import { showSuccessToast, validateUrl } from "./utils/index";
import { createBookmark, getWebsiteMetadata } from "./services/bookmark";
import { useTags } from "./hooks/useTags";
import { CreateTagForm } from "./components/CreateTagForm";
import { LinkdingShortcut } from "./types/shortcuts";

export default function CreateBookmarks() {
  const { push } = useNavigation();
  const [linkdingAccountMap, setLinkdingAccountMap] = useState<LinkdingAccountMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [urlError, setUrlError] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [read, setRead] = useState<boolean>(false);

  const { selectedTags, setSelectedTags, availableTags, handleCreateTag } = useTags(
    selectedAccount ? linkdingAccountMap[selectedAccount] : null,
    []
  );

  useEffect(() => {
    getPersistedLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        setLinkdingAccountMap(linkdingMap);
      }
    });
  }, [setLinkdingAccountMap]);

  function getMetadata(url: string) {
    setLoading(true);
    getWebsiteMetadata(url)
      .then((metadata) => {
        if (metadata) {
          setTitle(metadata.title);
          setDescription(metadata.description ?? "");
        }
      })
      .finally(() => setLoading(false));
  }

  function validateBookmarkUrl(url?: string): void {
    if (url) {
      if (!validateUrl(url)) {
        setUrlError("URL must start with http:// or https://");
      } else {
        getMetadata(url);
        setUrl(url);
      }
    } else {
      setUrlError("URL is required");
    }
  }

  function dropUrlErrors(): void {
    setUrlError(undefined);
  }

  function submitForm(formValues: PostLinkdingBookmarkPayload & { linkdingAccountName: string }) {
    const linkdingAccount = linkdingAccountMap[formValues.linkdingAccountName];
    createBookmark(linkdingAccount, {
      ...formValues,
      shared: false,
      is_archived: false,
      tag_names: selectedTags,
    }).then((data) => {
      showSuccessToast("Bookmark created successfully");
      popToRoot();
    });
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel title="Create Bookmark">
          <Action.SubmitForm
            onSubmit={(
              formValues: PostLinkdingBookmarkPayload & {
                linkdingAccountName: string;
              }
            ) => submitForm(formValues)}
            title="Create Bookmark"
            icon={{ source: Icon.SaveDocument }}
          />
          <Action
            title="Create New Tag"
            icon={{ source: Icon.Tag }}
            shortcut={LinkdingShortcut.CREATE_TAG_SHORTCUT}
            onAction={() => {
              push(
                <CreateTagForm
                  onTagCreated={handleCreateTag}
                />
              );
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="linkdingAccountName" onChange={setSelectedAccount} title="Linkding Account">
        {Object.keys(linkdingAccountMap).map((name) => {
          return <Form.Dropdown.Item key={name} title={name} value={name}></Form.Dropdown.Item>;
        })}
      </Form.Dropdown>
      <Form.TextField
        onBlur={(event) => validateBookmarkUrl(event.target.value)}
        onChange={dropUrlErrors}
        error={urlError}
        id="url"
        title="URL"
      />
      <Form.TextField value={title} onChange={setTitle} id="title" title="Title" />
      <Form.TextArea value={description} onChange={setDescription} id="description" title="Description" />
      <Form.TextArea value={notes} onChange={setNotes} id="notes" title="Notes" />
      <Form.Checkbox value={read} onChange={setRead} id="unread" label="Mark as Unread" />
      <Form.TagPicker
        id="tags"
        title="Tags"
        placeholder="Select tags"
        value={selectedTags}
        onChange={setSelectedTags}
      >
        {availableTags.map((tag) => (
          <Form.TagPicker.Item key={tag} value={tag} title={tag} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
