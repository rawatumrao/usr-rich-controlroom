import { createContext } from "react";

export const AppContext = createContext({
  token: "",
  meRole: "false",
  voiceActivated: true,
  setVoiceActivated: () => {},
});
