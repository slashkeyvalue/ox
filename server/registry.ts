export class Registry<T> {
  name: string;
  private members: Record<string, T> = {};

  constructor(name: string) {
    this.name = name;

    exports(`Get${name}`, (id: string) => {
      return this.get(id);
    });

    exports(`GetAll${name}s`, () => {
      return this.members;
    });
  }

  get(id: string) {
    return this.members[id.toString()];
  }

  set(id: string, member: T) {
    return (this.members[id] = member);
  }
}
