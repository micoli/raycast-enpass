import { deleteExpiredCachedMasterPassword } from "./lib/cache";

export default function Command() {
  deleteExpiredCachedMasterPassword();
}
