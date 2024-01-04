import { Registry } from "registry";

export class OxPlayer extends Registry {
  source: number;
  userId: number;
  charId: number;
  stateId: string;
  username: string;
  static byUserId: Record<string, string> = {};

  constructor(source: number) {
    super();
    const playerSrc = source.toString();

    this.source = source;
    this.username = GetPlayerName(playerSrc);
    this.userId = 68 + source;

    OxPlayer.add(playerSrc, this);
    OxPlayer.byUserId[this.userId] = playerSrc;
  }

  static get(id: string | number): OxPlayer {
    return this.members[id.toString()];
  }

  static getFromUserId(id: number) {
    return this.get(OxPlayer.byUserId[id.toString()]);
  }

  static getAll(): Record<string, OxPlayer> {
    return this.members;
  }

  print(...args: any) {
    console.log("publicmethod", ...args);
  }

  getUserId() {
    return this.userId;
  }

  /** temporary call method for easy bindings */
  call = (fn: string, ...args: any) => {
    const prop = (this as any)[fn];

    if (typeof prop === "function") return prop(...args);

    return prop;
  };
}
