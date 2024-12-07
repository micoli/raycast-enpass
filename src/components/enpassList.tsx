import {
  ActionPanel,
  showToast,
  Action,
  Clipboard,
  showHUD,
  Toast,
  openCommandPreferences,
  List,
  Icon,
  popToRoot,
} from "@raycast/api";

import { useEffect, useState } from "react";
import { EnpassEntry, searchEntries } from "../lib/enpass-cli";
import { useDebounce } from "@uidotdev/usehooks";
import { useToggle } from "../hooks/useToggle";
import { preferences } from "../lib/preferences";
import { getCachedMasterPassword } from "../lib/cache";
import { useInterval } from "../hooks/useInterval";

const getEntryFields = (enpassEntry: EnpassEntry) => {
  return Object.entries(enpassEntry).filter(([key, entry]) => {
    return !(key === "_key" || entry === "");
  });
};

const capitalize = (val: string): string => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

const copyAndAlert = async (label: string, text: string) => {
  await showHUD(`${capitalize(label)} copied`);
  await Clipboard.copy(text);
};

export default function EnpassList({ masterPassword }: { masterPassword: string }) {
  const [entries, setEntries] = useState<EnpassEntry[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [isDetailedViewEnabled, showDetailedView, hideDetailedView] = useToggle(true);
  const [isPasswordViewable, setPasswordIsViewable, setPasswordIsNotViewable] = useToggle(false);
  const debouncedFilter = useDebounce(filter, 200);

  useInterval(() => {
    if (null !== getCachedMasterPassword()) {
      return;
    }
    showToast({
      style: Toast.Style.Failure,
      title: "MasterPassword has expired",
    }).then(() => {
      popToRoot({
        clearSearchBar: false,
      });
    });
  }, 30 * 1000);

  const fetchAndSetEntries = async () => {
    if (filter === "") {
      setEntries([]);
      return;
    }
    try {
      const _entries = await searchEntries(
        preferences.enpassCliBinary,
        preferences.enpassVaultPath,
        masterPassword,
        filter === "*" ? "" : filter,
      );
      setEntries(_entries);
    } catch (error) {
      await showToast({ style: Toast.Style.Failure, title: String(error) });
    }
  };

  useEffect(() => {
    fetchAndSetEntries().then();
  }, [debouncedFilter]);

  useEffect(() => {
    fetchAndSetEntries().then();
  }, []);

  return (
    <List
      onSearchTextChange={setFilter}
      searchBarPlaceholder="Search on enpass"
      isShowingDetail={isDetailedViewEnabled}
      actions={
        <ActionPanel>
          <Action title="Open Extension Preferences" onAction={openCommandPreferences} />
        </ActionPanel>
      }
    >
      {entries.length === 0 && (
        <List.EmptyView title={filter ? "Nothing to display" : "Please type a filter to query enpass"} />
      )}
      {entries.map((enpassEntry) => (
        <List.Item
          key={`${enpassEntry._key}`}
          title={`${enpassEntry.title}`}
          keywords={Object.values(enpassEntry).filter((value) => value)}
          accessories={[
            {
              tag: enpassEntry.label,
            },
            {
              tag: enpassEntry.category,
            },
          ]}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  {getEntryFields(enpassEntry).map(([entryLabel, entryValue]) => (
                    <List.Item.Detail.Metadata.TagList key={entryLabel} title={capitalize(entryLabel)}>
                      <List.Item.Detail.Metadata.TagList.Item
                        text={entryLabel === "password" && !isPasswordViewable ? "xxxxx" : entryValue}
                        color={"#eed535"}
                      />
                    </List.Item.Detail.Metadata.TagList>
                  ))}
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                {isPasswordViewable ? (
                  <Action title="Hide Passwords" onAction={setPasswordIsNotViewable} icon={Icon.EyeDisabled} />
                ) : (
                  <Action title="Show Passwords" onAction={setPasswordIsViewable} icon={Icon.Eye} />
                )}

                {getEntryFields(enpassEntry)
                  .filter(([entryLabel, entryValue]) => entryLabel === "password")
                  .map(([entryLabel, entryValue]) => (
                    <Action
                      key={entryValue}
                      icon={Icon.Key}
                      title={`Copy Password`}
                      onAction={() => copyAndAlert(entryLabel, entryValue)}
                    />
                  ))}
              </ActionPanel.Section>
              <ActionPanel.Section>
                {getEntryFields(enpassEntry)
                  .filter(([entryLabel, entryValue]) => entryLabel !== "password")
                  .map(([entryLabel, entryValue]) => (
                    <Action
                      key={entryLabel}
                      icon={Icon.CopyClipboard}
                      title={`Copy ${capitalize(entryLabel)} : ${entryLabel === "password" && !isPasswordViewable ? "xxxxx" : entryValue}`}
                      onAction={() => copyAndAlert(entryLabel, entryValue)}
                    />
                  ))}
              </ActionPanel.Section>
              <ActionPanel.Section>
                {isDetailedViewEnabled ? (
                  <Action title="Hide Details" onAction={hideDetailedView} icon={Icon.EyeDisabled} />
                ) : (
                  <Action title="Show Details" onAction={showDetailedView} icon={Icon.Eye} />
                )}
                <Action title="Open Extension Preferences" onAction={openCommandPreferences} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
