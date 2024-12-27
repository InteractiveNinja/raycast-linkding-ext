import { LinkdingAccountForm, LinkdingAccountMap } from "../types";
import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import { validateUrl } from "../utils";

export function CreateEditAccount({
  initialValue,
  onSubmit,
  linkdingAccountMap,
}: {
  initialValue?: LinkdingAccountForm;
  onSubmit: (formValue: LinkdingAccountForm) => void;
  linkdingAccountMap: LinkdingAccountMap;
}) {
  const { pop } = useNavigation();

  const [accountNameError, setAccountNameError] = useState<string | undefined>();
  const [serverUrlError, setServerUrlError] = useState<string | undefined>();
  const [apiKeyError, setApiKeyError] = useState<string | undefined>();

  function submitForm(formValues: LinkdingAccountForm): void {
    onSubmit({
      name: formValues.name?.trim() ?? initialValue?.name,
      apiKey: formValues.apiKey.trim(),
      serverUrl: formValues.serverUrl.trim(),
      ignoreSSL: formValues.ignoreSSL,
    });
    pop();
  }

  function validateAccountname(value?: string) {
    if (value) {
      if (Object.keys(linkdingAccountMap).includes(value)) {
        setAccountNameError("Name already used");
      }
    } else {
      setAccountNameError("Name is required");
    }
  }

  function dropAccountNameError() {
    setAccountNameError(undefined);
  }

  function validateServerUrl(value?: string) {
    if (value) {
      if (!validateUrl(value)) {
        setServerUrlError("Server URL must be a valide url");
      }
    } else {
      setServerUrlError("Server URL is required");
    }
  }

  function dropServerUrlError() {
    setServerUrlError(undefined);
  }

  function validateApiKey(value?: string) {
    if (!value) {
      setApiKeyError("API Key is required");
    }
  }

  function dropApiKeyError() {
    setApiKeyError(undefined);
  }

  return (
    <Form
      navigationTitle={initialValue ? `Edit Linkding "${initialValue.name}" Account` : "Create new Linkding Account"}
      actions={
        <ActionPanel title="Manage Accounts">
          <Action.SubmitForm
            title={initialValue ? "Edit Account" : "Create Account"}
            onSubmit={(values: LinkdingAccountForm) => submitForm(values)}
          />
        </ActionPanel>
      }
    >
      {initialValue?.name ? (
        <Form.Description title="Accountname" text="Accountname cant be changed" />
      ) : (
        <Form.TextField
          defaultValue={initialValue?.name}
          id="name"
          error={accountNameError}
          onBlur={(event) => validateAccountname(event.target.value)}
          onChange={dropAccountNameError}
          title="Account Name"
          placeholder="A Name for the Account"
        />
      )}
      <Form.TextField
        defaultValue={initialValue?.serverUrl}
        id="serverUrl"
        error={serverUrlError}
        onBlur={(event) => validateServerUrl(event.target.value)}
        onChange={dropServerUrlError}
        title="Linkding Server URL"
        placeholder="URL from the Linkding instance"
      />
      <Form.PasswordField
        defaultValue={initialValue?.apiKey}
        id="apiKey"
        error={apiKeyError}
        onBlur={(event) => validateApiKey(event.target.value)}
        onChange={dropApiKeyError}
        title="Linkding API Key"
        placeholder="API Key from from the Linkding instance"
      />
      <Form.Checkbox
        defaultValue={initialValue?.ignoreSSL}
        id="ignoreSSL"
        title="Ignore Server SSL"
        label="Ignore SSL Certificate from Linkding Server"
      />
    </Form>
  );
}
