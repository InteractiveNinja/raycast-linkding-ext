import { Action, ActionPanel, Icon, Form, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { LinkdingAccount, LinkdingBookmark } from "../types/linkding-types";
import { getTags } from "../service/bookmark-service";
import { showSuccessToast, showErrorToast } from "../util/bookmark-util";
import { CreateTagForm } from "./CreateTagForm";

interface EditBookmarkFormProps {
  bookmark: LinkdingBookmark;
  selectedAccount: LinkdingAccount;
  onSubmit: (title: string, notes: string, tagNames: string[]) => Promise<void>;
}

export function EditBookmarkForm({ bookmark, selectedAccount, onSubmit }: EditBookmarkFormProps) {
  const { pop, push } = useNavigation();
  const [title, setTitle] = useState(bookmark.title);
  const [notes, setNotes] = useState(bookmark.notes || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(bookmark.tag_names);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadTags();
  }, [selectedAccount]);

  async function loadTags() {
    const tags = await getTags(selectedAccount);
    if (tags) {
      setAvailableTags(tags);
    }
  }

  async function handleSubmit() {
    await onSubmit(title, notes, selectedTags);
    showSuccessToast("Bookmark updated successfully");
    pop();
  }

  function handleCreateTag(tagName: string) {
    const trimmedTagName = tagName.trim();
    if (!trimmedTagName) return;

    // 将空白字符替换为连字符
    const normalizedTagName = trimmedTagName.replace(/\s+/g, '-');

    // 检查标签是否已存在（不区分大小写）
    const existingTag = availableTags.find(tag => tag.toLowerCase() === normalizedTagName.toLowerCase());
    const isSelected = selectedTags.some(tag => tag.toLowerCase() === normalizedTagName.toLowerCase());

    if (existingTag) {
      if (isSelected) {
        // 标签已存在且已被选中
        showErrorToast(new Error(`Tag "${existingTag}" is already selected`));
      } else {
        // 标签已存在但未被选中，选中它
        setSelectedTags(current => [...current, existingTag]);
        showSuccessToast(`Tag "${existingTag}" has been selected`);
      }
    } else {
      // 标签不存在，创建新标签
      setSelectedTags(current => [...current, normalizedTagName]);
      setAvailableTags(current => [...current, normalizedTagName]);
      showSuccessToast(`Tag "${normalizedTagName}" will be created`);
    }
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
            shortcut={{ modifiers: ["ctrl"], key: "t" }}
            onAction={() => {
              push(
                <CreateTagForm
                  selectedAccount={selectedAccount}
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
