declare type Dict<T> = { [key: string]: T };

declare interface NewCharacter {
  firstName: string;
  lastName: string;
  gender: string;
  date: number;
}

declare interface Character {
  charId: number;
  stateId: string;
  firstName: string;
  lastName: string;
  metadata: Dict<any>;
  statuses: Dict<number>;
  licenses: Dict<Dict<any>>;
  x?: number;
  y?: number;
  z?: number;
  heading?: number;
}
