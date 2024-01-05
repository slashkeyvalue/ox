import { Registry } from "registry";
import { GetUserIdFromIdentifier } from "./db";

export class OxPlayer extends Registry {
  source: number | string;
  userId: number;
  charId: number;
  stateId: string;
  username: string;
  identifier: string;

  protected static members: Dict<OxPlayer> = {};
  protected static keys: Dict<Dict<OxPlayer>> = {
    userId: {},
    charId: {},
  };

  constructor(source: number) {
    super();
    this.source = source;
  }

  async loadPlayerData() {
    const primaryIdentifier =
      GetPlayerIdentifierByType(this.source as string, "license2") ||
      "license2:611c0a85f0fc5292eb0fdd1d38bedd7c140c398e";

    if (!primaryIdentifier) {
      console.error(`unable to determine 'license2' identifier.`);
    }

    const identifier = primaryIdentifier.substring(
      primaryIdentifier.indexOf(":") + 1
    );

    let userId = await GetUserIdFromIdentifier(identifier);

    if (userId && OxPlayer.getFromUserId(userId)) {
      if (userId) {
        throw new Error(`userId '${userId}' is already active.`);
      }

      console.log("Second login for", userId);

      userId = await GetUserIdFromIdentifier(identifier, 1);

      if (userId && OxPlayer.getFromUserId(userId)) {
        throw new Error(`userId '${userId}' is already active.`);
      }
    }

    if (!userId) {
      console.log("Register a new user account", identifier);
      userId = (userId as number) + 68;
    }

    this.userId = userId;
    this.identifier = identifier;
    this.username = GetPlayerName(this.source as string);
  }

  setAsJoined(playerId?: number) {
    if (playerId) this.source = playerId;

    OxPlayer.add(this.source, this);
    Player(this.source).state.set("userId", this.userId, true);

    this.print(this);
  }

  static get(id: string | number) {
    return this.members[id];
  }

  static getFromUserId(id: number) {
    return this.keys.userId[id];
  }

  static getAll(): Dict<OxPlayer> {
    return this.members;
  }

  print(...args: any) {
    console.log(...args);
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

OxPlayer.init();
