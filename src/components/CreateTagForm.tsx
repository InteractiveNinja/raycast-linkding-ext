import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import { LinkdingAccount } from "../types/linkding-types";

interface CreateTagFormProps {
  selectedAccount: LinkdingAccount;
  onTagCreated: (tagName: string) => void;
}

export function CreateTagForm({ selectedAccount, onTagCreated }: CreateTagFormProps) {
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
