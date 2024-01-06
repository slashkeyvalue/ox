import { ClassInterface } from 'classInterface';
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

export class OxPlayer extends ClassInterface {
  source: number | string;
  userId: number;
  username: string;
  identifier: string;
  #character?: Character;
  #characters?: Partial<Character>[];

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

  /** Adds a player to the player registry. */
  static setAsJoined(player: OxPlayer, newId?: number) {
    if (newId) player.source = newId;

    OxPlayer.add(player.source, player);
    Player(player.source).state.set('userId', player.userId, true);

    console.log(player);
  }

  constructor(source: number) {
    super();
    this.source = source;
    this.#characters = [];
    this.#character = {} as any;
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

  /** Stores a value in the active character's metadata. */
  set(key: string, value: any, replicated?: boolean) {
    this.#character.metadata[key] = value;

    if (replicated) emitNet('ox:setPlayerData', this.source, key, value);
  }

  /** Gets a value stored in active character's metadata. */
  get(key: string) {
    return this.#character.metadata[key];
  }

  getPlayersInScope() {}

  isPlayerInScope(targetId: number) {}

  triggerScopedEvent(eventName: string, ...args: any[]) {}

  setGroup(groupName: string, grade?: number) {}

  getGroup(groupName: string) {}

  getGroups(filter?: string | string[] | Dict<number>) {}

  setStatus() {}

  getStatus(statusName: string) {}

  getStatuses() {}

  addStatus(statusName: string, value: number) {}

  removeStatus(statusName: string, value: number) {}

  addLicense(licenseName: string) {}

  removeLicense(licenseName: string) {}

  logout(dropped: boolean) {}

  #test(...args: any[]) {
    console.log(this.userId, this.username, ...args);
  }
}

OxPlayer.init();
