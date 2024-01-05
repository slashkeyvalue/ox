export class Registry {
  protected static members: Record<string, any>;
  protected static keys?: Record<string, Record<string, any>>;

  static init() {
    const name = this.name;

    // e.g. exports.ox.getOxPlayer
    exports(`get${name}`, (id: string) => {
      return this.members[id];
    });

    // e.g. exports.ox.getOxPlayers
    exports(`get${name}s`, () => {
      return this.members;
    });

    console.log(`instantiated Registry<${name}> and created exports`);
  }

  static get(id: string | number) {
    return this.members[id];
  }

  static getAll() {
    return this.members;
  }

  static add(id: string | number, member: any) {
    console.log(`instantiated OxPlayer<${member.userId}> and created keys`);
    this.members[id] = member;

    if (this.keys) {
      Object.entries(this.keys).forEach(([key, obj]) => {
        obj[member[key]] = member;
      });
    }
  }

  static remove(id: string | number) {
    const member = this.members[id];

    if (!member) return false;

    if (this.keys) {
      Object.entries(this.keys).forEach(([key, obj]) => {
        if (member[key]) {
          delete obj[member[key]];
        }
      });
    }

    delete this.members[id];

    return true;
  }
}
