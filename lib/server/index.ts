import { GetPlayer } from './player';

interface OxServer {
  [exportKey: string]: Function;
}

export const Ox: OxServer = exports.ox_core;

export * from './player';

// setTimeout(() => {
//   const player = GetPlayer(1);

//   if (!player) return;

//   console.log(player);
//   player.test('hello world');

//   const player2 = GetPlayer(2);
// }, 1000);
