import { Registry } from "registry";

function getUserIdFromIdentifier(identifier: string, offset?: number) {
  return exports.oxmysql.scalar_async(
    `SELECT userId FROM users WHERE license2 = ? LIMIT ?, 1`,
    [identifier, offset || 0]
  );
}

export class OxPlayer extends Registry {
  source: number | string;
  userId: number;
  charId: number;
  stateId: string;
  username: string;
  identifier: string;

  protected static members: Record<string, OxPlayer> = {};
  protected static keys: Record<string, Record<string, OxPlayer>> = {
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

    this.identifier = identifier;
    this.username = GetPlayerName(this.source as string);
    this.userId = await getUserIdFromIdentifier(identifier);

    if (this.userId && OxPlayer.getFromUserId(this.userId)) {
      if (this.userId) {
        throw new Error(`userId '${this.userId}' is already active.`);
      }

      console.log("Second login for", this.userId);

      this.userId = await getUserIdFromIdentifier(identifier, 1);

      if (this.userId && OxPlayer.getFromUserId(this.userId)) {
        throw new Error(`userId '${this.userId}' is already active.`);
      }
    }

    if (!this.userId) {
      console.log("Register a new user account", this.identifier);
      this.userId = (this.userId as number) + 68;
    }
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

  static getAll(): Record<string, OxPlayer> {
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
