import { atom } from "recoil";

export const gameIsWonState = atom({
  key: "game-is-won",
  default: false,
});
