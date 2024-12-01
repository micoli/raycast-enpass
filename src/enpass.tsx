import { useState } from "react";
import EnpassList from "./components/enpassList";
import MasterPasswordForm from "./components/masterPasswordForm";
import { getCachedMasterPassword, setCachedMasterPassword } from "./lib/cache";
import { preferences } from "./lib/preferences";

export default function Command() {
  const [masterPassword, setMasterPassword] = useState<string | null>(getCachedMasterPassword());
  const _setCachedMasterPassword = (password: string) => {
    setCachedMasterPassword(password, parseInt(preferences.masterPasswordTimeout));
    setMasterPassword(password);
  };
  if (masterPassword) {
    return <EnpassList masterPassword={masterPassword} />;
  }
  return <MasterPasswordForm setMasterPassword={_setCachedMasterPassword} />;
}
