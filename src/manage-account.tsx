import { Action, ActionPanel, Form, List, useNavigation } from "@raycast/api";
import { LinkdingAccountMap, LinkdingForm } from "./types/linkding-types";
import React, { useEffect, useState } from "react";
import { getPersistedLinkdingAccounts, setPersistedLinkdingAccounts } from "./service/user-account-service";

export default function manageAccounts() {
  const [getLinkdingAccountMap, setLinkdingAccountMap] = useState<LinkdingAccountMap>({});
  const [getSearchText, setSearchText] = useState("");
  const { push } = useNavigation();
  useEffect(() => {
    getPersistedLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        const searchedLinkdingAccounts = Object.keys(linkdingMap)
          .filter((account) => getSearchText === "" || account.includes(getSearchText))
          .reduce((prev, account) => ({ ...prev, [account]: linkdingMap[account] }), {});
        setLinkdingAccountMap(searchedLinkdingAccounts);
      }
    });
  }, [setLinkdingAccountMap, getSearchText]);

  function deleteAccount(name: string): void {
    const { [name]: removed, ...filteredMapEntries } = getLinkdingAccountMap;
    updateLinkdingAccountMap(filteredMapEntries);
  }

  function createUpdateAccount(account: LinkdingForm): void {
    const { name, ...linkdingServer } = account;
    const accounts = { ...getLinkdingAccountMap, [name]: { ...linkdingServer } };
    updateLinkdingAccountMap(accounts);
  }

  function updateLinkdingAccountMap(linkdingMap: LinkdingAccountMap) {
    setLinkdingAccountMap(linkdingMap);
    setPersistedLinkdingAccounts(linkdingMap);
  }

  function showCreateEditAccount(formValue?: LinkdingForm) {
    push(<CreateEditAccount initialValue={formValue} onSubmit={(formValue) => createUpdateAccount(formValue)} />);
  }

  return (
    <List
      navigationTitle="Manage Linkding Accounts"
      onSearchTextChange={setSearchText}
      throttle
      actions={
        <ActionPanel title="Manage Accounts">
          <Action title="Create New Account" onAction={() => showCreateEditAccount()} />
        </ActionPanel>
      }
    >
      {Object.keys(getLinkdingAccountMap).length == 0 ? (
        <List.EmptyView title="No Accounts present" description="Create your first Account" />
      ) : (
        Object.entries(getLinkdingAccountMap).map(([name, linkdingAccount]) => {
          return (
            <List.Item
              key={name}
              title={name}
              subtitle={linkdingAccount.serverUrl}
              actions={
                <ActionPanel title="Manage Accounts">
                  <Action title="Create New Account" onAction={() => showCreateEditAccount()} />
                  <Action title="Edit Account" onAction={() => showCreateEditAccount({ name, ...linkdingAccount })} />
                  <Action title="Delete Account" onAction={() => deleteAccount(name)} />
                </ActionPanel>
              }
            />
          );
        })
      )}
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
