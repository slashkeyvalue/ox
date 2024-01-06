import { OxPlayer } from 'server/player/class';

class PlayerInterface {
  constructor(
    public source: number,
    public userId: number,
    public username: string,
    public identifier: string
  ) {
    this.source = source;
    this.userId = userId;
    this.username = username;
    this.identifier = identifier;
  }
}

Object.keys(exports.ox.getOxPlayerCalls() || {}).forEach((method: string) => {
  (PlayerInterface.prototype as any)[method] = function (...args: any[]) {
    return exports.ox.callOxPlayer(this.source, method, ...args);
  };
});

export function GetPlayer(id: string | number): OxPlayer | void {
  const player = exports.ox.getOxPlayer(id);

  if (!player) return console.error(`cannot create PlayerInterface<${id}> (invalid id)`);

  return new PlayerInterface(player.source, player.userId, player.username, player.identifier) as OxPlayer;
}
