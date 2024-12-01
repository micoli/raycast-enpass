import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";

import { useState } from "react";
import { checkMasterPassword, DatabaseConnectionStatus } from "../lib/enpass-cli";
import { preferences } from "../lib/preferences";

const getErrorMessage = (passwordResult: DatabaseConnectionStatus | null): string | undefined => {
  if (passwordResult === DatabaseConnectionStatus.IncorrectPassword) {
    return "Incorrect password.";
  }
  if (passwordResult === DatabaseConnectionStatus.UnknownVault) {
    return "Bad path for vault.";
  }
  return undefined;
};

export default function Command({ setMasterPassword }: { setMasterPassword: (string) => void }) {
  const [password, setPassword] = useState<string>("");
  const [passwordResult, setPasswordResult] = useState<null | DatabaseConnectionStatus>(null);

  const checkPassword = async (password: string) => {
    if (!password && password?.length === 0) {
      setPasswordResult(DatabaseConnectionStatus.IncorrectPassword);
      return;
    }
    checkMasterPassword(preferences.enpassCliBinary, preferences.enpassVaultPath, password).then((result) =>
      result === DatabaseConnectionStatus.Ok ? setPasswordResult(null) : setPasswordResult(result),
    );
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit Password"
            onSubmit={(values) => {
              if (passwordResult === DatabaseConnectionStatus.Ok || passwordResult === null) {
                setMasterPassword(values.password);
                return;
              }
              showToast({
                style: Toast.Style.Failure,
                title: "Cannot set password if there is still error",
                message: "Incorrect password",
              });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.PasswordField
        id="password"
        title="Password"
        placeholder="pa$$w0rd"
        error={getErrorMessage(passwordResult)}
        onChange={(value) => {
          setPassword(value);
          checkPassword(value);
        }}
        value={password}
        onBlur={(event) => {
          checkPassword(event.target.value);
        }}
      />
    </Form>
  );
}
