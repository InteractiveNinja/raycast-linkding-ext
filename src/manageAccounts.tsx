import { Action, ActionPanel, confirmAlert, Icon, List, useNavigation } from "@raycast/api";
import { LinkdingAccountForm, LinkdingAccountMap } from "./types/index";
import { useEffect, useState } from "react";
import { getPersistedLinkdingAccounts, setPersistedLinkdingAccounts } from "./services/account";
import { LinkdingShortcut } from "./types/shortcuts";
import _ from "lodash";
import { CreateEditAccount } from "./components/CreateEditAccount";

export default function ManageAccounts() {
  const [linkdingAccountMap, setLinkdingAccountMap] = useState<LinkdingAccountMap>({});
  const [searchText, setSearchText] = useState("");
  const [hasAccounts, setHasAccounts] = useState(false);
  const { push } = useNavigation();
  useEffect(() => {
    getPersistedLinkdingAccounts().then((linkdingMap) => {
      if (linkdingMap) {
        setHasAccounts(!_.isEmpty(linkdingMap));
        const searchedLinkdingAccounts = Object.keys(linkdingMap)
          .filter((account) => searchText === "" || account.includes(searchText))
          .reduce((prev, account) => ({ ...prev, [account]: linkdingMap[account] }), {});
        setLinkdingAccountMap(searchedLinkdingAccounts);
      }
    });
  }, [setLinkdingAccountMap, searchText]);

  function deleteAccount(name: string): void {
    confirmAlert({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this account?",
      primaryAction: {
        title: "Delete",
        onAction: () => {
          const { [name]: removed, ...filteredMapEntries } = linkdingAccountMap;
          updateLinkdingAccountMap(filteredMapEntries);
        },
      },
    });
  }

  function createUpdateAccount(account: LinkdingAccountForm): void {
    const { name, ...linkdingServer } = account;
    if (name) {
      const accounts = { ...linkdingAccountMap, [name]: { ...linkdingServer } };
      updateLinkdingAccountMap(accounts);
    }
  }

  function updateLinkdingAccountMap(linkdingMap: LinkdingAccountMap) {
    setLinkdingAccountMap(linkdingMap);
    setPersistedLinkdingAccounts(linkdingMap);
  }

  function showCreateEditAccount(formValue?: LinkdingAccountForm) {
    push(
      <CreateEditAccount
        initialValue={formValue}
        linkdingAccountMap={linkdingAccountMap}
        onSubmit={(formValue) => createUpdateAccount(formValue)}
      />
    );
  }

  return (
    <List
      navigationTitle="Manage Linkding Accounts"
      searchBarPlaceholder="Search through Accounts..."
      onSearchTextChange={setSearchText}
      throttle
      actions={
        <ActionPanel title="Manage Accounts">
          <Action title="Create New Account" icon={{ source: Icon.Plus }} onAction={() => showCreateEditAccount()} />
        </ActionPanel>
      }
    >
      {Object.keys(linkdingAccountMap).length == 0 && !hasAccounts ? (
        <List.EmptyView
          title="Your Linkding Account is not set up yet."
          description="Here, you can create your first account."
        />
      ) : (
        Object.entries(linkdingAccountMap).map(([name, linkdingAccount]) => {
          return (
            <List.Item
              key={name}
              title={name}
              subtitle={linkdingAccount.serverUrl}
              actions={
                <ActionPanel title="Manage Accounts">
                  <Action
                    title="Create Account"
                    icon={{ source: Icon.Plus }}
                    onAction={() => showCreateEditAccount()}
                  />
                  <Action
                    title="Edit Account"
                    icon={{ source: Icon.Pencil }}
                    onAction={() => showCreateEditAccount({ name, ...linkdingAccount })}
                  />
                  <Action
                    title="Delete Account"
                    icon={{ source: Icon.Trash }}
                    shortcut={LinkdingShortcut.DELETE_SHORTCUT}
                    onAction={() => deleteAccount(name)}
                  />
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
