import { useState } from "react";

export const useToggle = (initialState: boolean): [boolean, () => void, () => void, () => void] => {
  const [ok, setOk] = useState(initialState);
  const setIsOk = () => setOk(true);
  const setIsNotOk = () => setOk(false);
  const toggle = () => setOk(!ok);
  return [ok, setIsOk, setIsNotOk, toggle];
};
