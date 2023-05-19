import { Action, ActionPanel, Form, List, LocalStorage, useNavigation } from "@raycast/api";
import { LinkdingForm, LinkdingMap } from "./types/linkding-types";
import React, { useEffect, useState } from "react";

export const LINKDING_ACCOUNTS = "linkding_accounts";

export function getLinkdingAccounts() {
  return LocalStorage.getItem<string>(LINKDING_ACCOUNTS).then((unparsedAccounts) => {
    if (unparsedAccounts) {
      return JSON.parse(unparsedAccounts) as LinkdingMap;
    }
  });
}

export default function manageAccounts() {
  const [getLinkdingMap, setLinkdingMap] = useState<LinkdingMap>({});
  const { push } = useNavigation();
  useEffect(() => {
    getLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        setLinkdingMap(linkdingMap);
      }
    });
  }, [setLinkdingMap]);

  function deleteAccount(name: string): void {
    const { [name]: removed, ...filteredMapEntries } = getLinkdingMap;
    updateLinkdingMap(filteredMapEntries);
  }

  function createUpdateAccount(account: LinkdingForm): void {
    const { name, ...linkdingServer } = account;
    const accounts = { ...getLinkdingMap, [name]: { ...linkdingServer } };
    updateLinkdingMap(accounts);
  }

  function updateLinkdingMap(linkdingMap: LinkdingMap) {
    setLinkdingMap(linkdingMap);
    LocalStorage.setItem(LINKDING_ACCOUNTS, JSON.stringify(linkdingMap));
  }

  function showCreateEditAccount(formValue?: LinkdingForm) {
    push(<CreateEditAccount initialValue={formValue} onSubmit={(formValue) => createUpdateAccount(formValue)} />);
  }

  return (
    <List
      navigationTitle="Manage Linkding Accounts"
      actions={
        <ActionPanel title="Manage Accounts">
          <Action title="Create New Account" onAction={() => showCreateEditAccount()} />
        </ActionPanel>
      }
    >
      {Object.entries(getLinkdingMap).map(([name, linkdingServer]) => {
        return (
          <List.Item
            key={name}
            title={name}
            subtitle={linkdingServer.serverUrl}
            actions={
              <ActionPanel title="Manage Accounts">
                <Action title="Create New Account" onAction={() => showCreateEditAccount()} />
                <Action title="Edit Account" onAction={() => showCreateEditAccount({ name, ...linkdingServer })} />
                <Action title="Delete Account" onAction={() => deleteAccount(name)} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

function CreateEditAccount({
  initialValue,
  onSubmit,
}: {
  initialValue?: LinkdingForm;
  onSubmit: (formValue: LinkdingForm) => void;
}) {
  const { pop } = useNavigation();

  function submitForm(formValues: LinkdingForm): void {
    onSubmit(formValues);
    pop();
  }

  return (
    <Form
      navigationTitle={initialValue ? "Edit Linkding Account" : "Create new Linkding Account"}
      actions={
        <ActionPanel title="Manage Accounts">
          <Action.SubmitForm
            title={initialValue ? "Edit Account" : "Create Account"}
            onSubmit={(values: LinkdingForm) => submitForm(values)}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        defaultValue={initialValue?.name}
        id="name"
        title="Accountname"
        placeholder="A Name for the Account"
      />
      <Form.TextField
        defaultValue={initialValue?.serverUrl}
        id="serverUrl"
        title="Linkding Server URL"
        placeholder="URL from the Linkding instance"
      />
      <Form.PasswordField
        defaultValue={initialValue?.apiKey}
        id="apiKey"
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
