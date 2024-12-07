import { execa, ExecaError } from "execa";

export interface EnpassEntry {
  _key: string;
  category: string;
  login: string;
  title: string;
  password: string;
  label: string;
  type: string;
}

export enum DatabaseConnectionStatus {
  Ok,
  UnknownVault,
  IncorrectPassword,
  UnknownError,
}

export async function searchEntries(
  enpassCliBinary: string,
  enpassVaultPath: string,
  masterPassword: string,
  filter: string,
): Promise<EnpassEntry[]> {
  try {
    const env = {
      MASTERPW: masterPassword,
    };
    const result = await execa({
      env,
      verbose: "short",
    })`${enpassCliBinary} -json --vault=${enpassVaultPath} -sort show ${filter.trim()}`;
    let idx = 0;
    return JSON.parse(result.stdout).map((entry) => {
      return {
        _key: `${idx++}`,
        ...entry,
      };
    });
  } catch (error) {
    // console.log(error);
    if (error instanceof ExecaError) {
      console.error(error.stderr);
    }
    return [];
  }
}

export async function checkMasterPassword(
  enpassCliBinary: string,
  enpassVaultPath: string,
  masterPassword: string,
): Promise<DatabaseConnectionStatus> {
  try {
    const env = {
      MASTERPW: masterPassword,
    };
    const filter = "01JE1KT064F4KJ0RY37R8S8YCD01JE1KT7YV2SPSMH8R0RWR3KGX01JE1KTJK6ECSSKGEK9MQFP089";
    await execa({
      env,
      verbose: "none",
    })`${enpassCliBinary} -json --vault=${enpassVaultPath} -sort show ${filter}`;
    return DatabaseConnectionStatus.Ok;
  } catch (error) {
    // console.log(error)

    if (error.exitCode === 1) {
      return DatabaseConnectionStatus.UnknownVault;
    }

    if (error.exitCode === 2) {
      return DatabaseConnectionStatus.IncorrectPassword;
    }

    return DatabaseConnectionStatus.UnknownError;
  }
}
