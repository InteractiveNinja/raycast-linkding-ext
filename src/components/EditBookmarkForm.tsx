import { Action, ActionPanel, Icon, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import { LinkdingAccount, LinkdingBookmark } from "../types/index";
import { showSuccessToast } from "../utils/index";
import { useTags } from "../hooks/useTags";
import { CreateTagForm } from "./CreateTagForm";
import { LinkdingShortcut } from "../types/shortcuts";

interface EditBookmarkFormProps {
  bookmark: LinkdingBookmark;
  selectedAccount: LinkdingAccount | null;
  onSubmit: (title: string, notes: string, tagNames: string[]) => Promise<void>;
}

export function EditBookmarkForm({ bookmark, selectedAccount, onSubmit }: EditBookmarkFormProps) {
  const { pop, push } = useNavigation();
  const [title, setTitle] = useState(bookmark.title);
  const [notes, setNotes] = useState(bookmark.notes || "");
  const { selectedTags, setSelectedTags, availableTags, handleCreateTag } = useTags(selectedAccount, bookmark.tag_names);

  async function handleSubmit() {
    await onSubmit(title, notes, selectedTags);
    showSuccessToast("Bookmark updated successfully");
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Update Bookmark"
            icon={{ source: Icon.SaveDocument }}
            onSubmit={handleSubmit}
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
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter bookmark title"
        value={title}
        onChange={setTitle}
      />
      <Form.TextArea
        id="notes"
        title="Notes"
        placeholder="Enter notes"
        value={notes}
        onChange={setNotes}
      />
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
