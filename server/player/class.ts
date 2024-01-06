import { ClassInterface } from 'classInterface';

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

  constructor(source: number) {
    super();
    this.source = source;
    this.#characters = [];
    this.#character = {} as any;
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
