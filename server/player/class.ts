import { ClassProvider } from 'provider';
import { GetUserIdFromIdentifier } from './db';

export interface Character {
  charId: number;
  stateId: string;
  firstName: string;
  lastName: string;
  metadata: Dict<any>;
  statuses: Dict<number>;
  inScope: Dict<true>;
  licenses: Dict<Dict<any>>;
  x?: number;
  y?: number;
  z?: number;
  heading?: number;
}

export class OxPlayer extends ClassProvider {
  source: number | string;
  userId: number;
  username: string;
  identifier: string;
  private character?: Character;
  private characters?: Partial<Character>[];

  protected static members: Dict<OxPlayer> = {};
  protected static keys: Dict<Dict<OxPlayer>> = {
    userId: {},
  };

  /** Get an instance of OxPlayer with the matching playerId. */
  static get(id: string | number) {
    return this.members[id];
  }

  /** Get an instance of OxPlayer with the matching userId. */
  static getFromUserId(id: number) {
    return this.keys.userId[id];
  }

  /** Gets all instances of OxPlayer. */
  static getAll(): Dict<OxPlayer> {
    return this.members;
  }

  constructor(source: number) {
    super();
    this.source = source;
  }

  /** Loads existing data for the player, or inserts new data into the database. */
  async loadPlayerData() {
    const primaryIdentifier =
      GetPlayerIdentifierByType(this.source as string, 'license2') ||
      'license2:611c0a85f0fc5292eb0fdd1d38bedd7c140c398e';

    if (!primaryIdentifier) {
      console.error(`unable to determine 'license2' identifier.`);
    }

    const identifier = primaryIdentifier.substring(primaryIdentifier.indexOf(':') + 1);

    let userId = await GetUserIdFromIdentifier(identifier);

    if (userId && OxPlayer.getFromUserId(userId)) {
      if (userId) {
        throw new Error(`userId '${userId}' is already active.`);
      }

      console.log('Second login for', userId);

      userId = await GetUserIdFromIdentifier(identifier, 1);

      if (userId && OxPlayer.getFromUserId(userId)) {
        throw new Error(`userId '${userId}' is already active.`);
      }
    }

    if (!userId) {
      console.log('Register a new user account', identifier);
      userId = (userId as number) + 68;
    }

    this.userId = userId;
    this.identifier = identifier;
    this.username = GetPlayerName(this.source as string);
  }

  /** Adds the player to the player registry. */
  setAsJoined(playerId?: number) {
    if (playerId) this.source = playerId;

    OxPlayer.add(this.source, this);
    Player(this.source).state.set('userId', this.userId, true);

    console.log(this);
  }

  /** Sets temporary metadata for the player. */
  set(key: string, value: any, replicated?: boolean) {
    this.character.metadata[key] = value;

    if (replicated) emitNet('ox:setPlayerData', this.source, key, value);
  }

  test(...args: any[]) {
    console.log(this.userId, this.username, ...args);
  }
}

OxPlayer.init(['test']);
