import { useState, useEffect } from "react";
import { LinkdingAccount } from "../types/index";
import { getTags } from "../services/tag";
import { showErrorToast, showSuccessToast } from "../utils/index";

export function useTags(selectedAccount: LinkdingAccount | null, initialTags: string[] = []) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAccount) {
      loadTags();
    }
  }, [selectedAccount]);

  async function loadTags() {
    if (!selectedAccount) return;

    const tags = await getTags(selectedAccount);
    if (tags) {
      setAvailableTags(tags);
    }
  }

  function createTag(tagName: string) {
    const trimmedTagName = tagName.trim();
    if (!trimmedTagName) return;

    // Replace whitespace with hyphens
    const normalizedTagName = trimmedTagName.replace(/\s+/g, "-");

    // Check if tag already exists (case-insensitive)
    const existingTag = availableTags.find((tag) => tag.toLowerCase() === normalizedTagName.toLowerCase());
    const isSelected = selectedTags.some((tag) => tag.toLowerCase() === normalizedTagName.toLowerCase());

    if (existingTag) {
      if (isSelected) {
        showErrorToast(new Error(`Tag "${existingTag}" is already selected`));
        return;
      }
      showSuccessToast(`Tag "${existingTag}" has been selected`);
      setSelectedTags([...selectedTags, existingTag]);
    } else {
      showSuccessToast(`Tag "${normalizedTagName}" will be created`);
      setSelectedTags([...selectedTags, normalizedTagName]);
      setAvailableTags([...availableTags, normalizedTagName]);
    }
  }

  return {
    selectedTags,
    setSelectedTags,
    availableTags,
    setAvailableTags,
    handleCreateTag: createTag,
    loadTags,
  };
}
