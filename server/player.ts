import { Registry } from "registry";

export const PlayerRegistry = new Registry<OxPlayer>("Player");

export class OxPlayer {
  source: number;
  userId: number;
  charId: number;
  stateId: string;
  username: string;

  constructor(source: number) {
    const playerSrc = source.toString();

    this.source = source;
    this.username = GetPlayerName(playerSrc);
    this.userId = 69;

    PlayerRegistry.set(playerSrc, this);
  }

  public publicmethod(...args: any) {
    console.log("publicmethod", ...args);
  }

  /** temporary call method for easy bindings */
  call = (fn: string, ...args: any) => {
    const prop = (this as any)[fn];

    if (typeof prop === "function") return prop(...args);

    return prop;
  };
}
