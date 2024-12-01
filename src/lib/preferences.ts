import { getPreferenceValues } from "@raycast/api";

export interface Preferences {
  enpassCliBinary: string;
  enpassVaultPath: string;
  masterPasswordTimeout: string;
}

export const preferences: Preferences = getPreferenceValues<Preferences>();
