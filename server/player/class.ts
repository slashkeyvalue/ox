import { ClassInterface } from 'classInterface';
import { CreateCharacter, DeleteCharacter, GetCharacters, IsStateIdAvailable, SaveCharacterData } from './db';
import { GetRandomChar, GetRandomInt } from '../../common';

export class OxPlayer extends ClassInterface {
  source: number | string;
  userId: number;
  username: string;
  identifier: string;
  ped: number;
  #inScope: Dict<true>;
  #character?: Partial<Character>;
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
    this.#inScope = {};
  }

  getCharId() {
    return this.#character?.charId;
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

  getPlayersInScope() {
    return this.#inScope;
  }

  isPlayerInScope(targetId: number) {
    return targetId in this.#inScope;
  }

  triggerScopedEvent(eventName: string, ...args: any[]) {
    for (const id in this.#inScope) {
      emitNet(eventName, id, ...args);
    }
  }

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

  #getSaveData() {
    const coords = GetEntityCoords(this.ped);

    return [
      coords[0],
      coords[1],
      coords[2],
      GetEntityHeading(this.ped),
      false,
      GetEntityHealth(this.ped),
      GetPedArmour(this.ped),
      JSON.stringify(this.#character.statuses || {}),
      this.#character.charId,
    ];
  }

  static saveAll(kickWithReason?: string) {
    const parameters = [];

    for (const id in this.members) {
      const player = this.members[id];

      if (player.#character) {
        parameters.push(player.#getSaveData());
      }

      if (kickWithReason) {
        player.#character = null;
        DropPlayer(player.source as string, kickWithReason);
      }
    }

    SaveCharacterData(parameters, true);
  }

  save() {
    if (this.#character) return SaveCharacterData(this.#getSaveData());
  }

  /** Adds a player to the player registry. */
  async setAsJoined() {
    if (!OxPlayer.add(this.source, this)) return;

    Player(this.source).state.set('userId', this.userId, true);
    emitNet('ox:startCharacterSelect', this.source, await this.#getCharacters());
  }

  async #getCharacters() {
    this.#characters = await GetCharacters(this.userId);
    return this.#characters;
  }

  async logout(dropped: boolean) {
    if (!this.#character) return;

    emit('ox:playerLogout', this.source, this.userId, this.#character.charId);
    await this.save();

    if (dropped) return;

    this.#character = null;

    emitNet('ox:startCharacterSelect', this.source, await this.#getCharacters());
  }

  async #generateStateId() {
    const arr = [];

    while (true) {
      for (let i = 0; i < 2; i++) arr[i] = GetRandomChar();
      for (let i = 2; i < 6; i++) arr[i] = GetRandomInt();

      const stateId = arr.join('');

      if (await IsStateIdAvailable(stateId)) return stateId;
    }
  }

  async createCharacter(data: NewCharacter) {
    const stateId = await this.#generateStateId();
    const phoneNumber: number = null;

    const character: Partial<Character> = {
      firstName: data.firstName,
      lastName: data.lastName,
      charId: await CreateCharacter(
        this.userId,
        stateId,
        data.firstName,
        data.lastName,
        data.gender,
        data.date,
        phoneNumber
      ),
      stateId: stateId,
    };

    this.#characters.push(character);
    emit('ox:createdCharacter', this.source, this.userId, character.charId);

    return this.#characters.length - 1;
  }

  #getCharacterSlotFromId(charId: number) {
    return this.#characters.findIndex((character) => {
      return character.charId === charId;
    });
  }

  async setActiveCharacter(data: number | NewCharacter) {
    if (this.#character) return;

    const character =
      this.#characters[
        typeof data === 'object' ? await this.createCharacter(data) : this.#getCharacterSlotFromId(data)
      ];

    this.#character = character;
    this.#characters = null;
    this.ped = GetPlayerPed(this.source as string);

    // setup groups
    // setup licenses
    // setup accounts
    // setup metadata

    console.log('setActiveCharacter', character);
    emit('ox:playerLoaded', this.source, this.userId, character.charId);

    return this.#character;
  }

  async deleteCharacter(charId: number) {
    if (this.getCharId()) return;

    const slot = this.#getCharacterSlotFromId(charId);

    if (slot < 0) return;

    if (await DeleteCharacter(charId)) {
      this.#characters.splice(slot, 1);
      emit('ox:deletedCharacter', this.source, this.userId, charId);
      return true;
    }
  }
}

OxPlayer.init();

exports('SaveAllPlayers', OxPlayer.saveAll);
