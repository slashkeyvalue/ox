export class Registry {
  static members: Record<string, any>;

  static init() {
    this.members = {};

    exports(`Get${this.name}`, (id: string) => {
      return this.get(id);
    });

    exports(`GetAll${this.name}s`, () => {
      return this.getAll();
    });

    console.log(`instantiated ${this.name} Registry and created exports`);
  }

  static add(id: string, instance: any) {
    if (!this.members) this.init();

    return (this.members[id] = instance);
  }

  static get(id: string | number) {
    return this.members[id.toString()];
  }

  static getAll() {
    return this.members;
  }

  static remove(id: string | number) {
    id = id.toString();

    if (this.members[id]) {
      delete this.members[id];
      return true;
    }

    return false;
  }
}
