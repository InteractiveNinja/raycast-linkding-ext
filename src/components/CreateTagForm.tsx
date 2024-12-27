import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";

interface CreateTagFormProps {
  onTagCreated: (tagName: string) => void;
}

export function CreateTagForm({ onTagCreated }: CreateTagFormProps) {
  const { pop } = useNavigation();
  const [tagName, setTagName] = useState("");

  function handleSubmit() {
    if (tagName.trim()) {
      onTagCreated(tagName.trim());
      pop();
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Tag" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="tagName"
        title="Tag Name"
        placeholder="Enter new tag name"
        value={tagName}
        onChange={setTagName}
        autoFocus
      />
    </Form>
  );
}
