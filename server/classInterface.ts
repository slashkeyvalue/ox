export class ClassInterface {
  protected static members: Dict<any>;
  protected static keys?: Dict<Dict<any>>;
  protected static callableMethods?: Dict<true>;

  static init() {
    const classMethods = Object.getOwnPropertyNames(this.prototype);

    if (classMethods) {
      this.callableMethods = {};

      classMethods.forEach((method) => {
        if (method !== 'constructor') this.callableMethods[method] = true;
      });
    }

    const name = this.name;

    // e.g. exports.ox.getOxPlayer
    exports(`get${name}`, (id: string) => {
      return this.members[id];
    });

    // e.g. exports.ox.getOxPlayers
    exports(`get${name}s`, () => {
      return this.members;
    });

    // e.g. exports.ox.getOxPlayerCalls
    exports(`get${name}Calls`, () => {
      return this.callableMethods;
    });

    // e.g. exports.ox.callOxPlayer
    exports(`call${name}`, (id: string | number, method: string, ...args: any[]) => {
      const member = this.members[id];

      if (!member) return console.error(`cannot call method ${method} on ${name}<${id}> (invalid player)`);

      if (!this.callableMethods[method])
        return console.error(`cannot call method ${method} on ${name}<${id}> (method is not exported)`);

      if (!member[method])
        return console.error(`cannot call method ${method} on ${name}<${id}> (method does not exist)`);

      return member[method](...args);
    });

    console.log(`instantiated Registry<${name}> and created exports`);

    return this;
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
