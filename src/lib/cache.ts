import { Cache } from "@raycast/api";

type MasterPasswordItem = {
  expiredAt: number;
  value: string;
};

const cache = new Cache({ namespace: "enpass-cache" });
const cache_key = "MasterPassword";

export const getCachedMasterPassword = () => {
  const cached = cache.get(cache_key);
  if (!cached) {
    return null;
  }
  const item: MasterPasswordItem = JSON.parse(cached);
  if (item.expiredAt < Date.now()) {
    cache.remove(cache_key);
    return null;
  }
  return item.value;
};

export const subscribeCachedMasterPassword = (onChange: (value) => void) => {
  return cache.subscribe((key, data) => {
    if (key === cache_key) {
      onChange(data);
    }
  });
};

export const deleteExpiredCachedMasterPassword = () => {
  const cached = cache.get(cache_key);
  if (!cached) {
    return false;
  }
  const item: MasterPasswordItem = JSON.parse(cached);
  if (item.expiredAt < Date.now()) {
    cache.remove(cache_key);
    return true;
  }
  return false;
};

export const setCachedMasterPassword = (password: string, expiresIn: number) => {
  cache.set(
    cache_key,
    JSON.stringify({
      expiredAt: Date.now() + expiresIn * 1000,
      value: password,
    }),
  );
};
