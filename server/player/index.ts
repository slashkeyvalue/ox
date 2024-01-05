import 'player/events';
import { GetPlayer } from '../../lib/server';

setTimeout(() => {
  const player = GetPlayer(1);

  if (!player) return;

  console.log(player);
  player.test('hello world');
  // player.setAsJoined();
  // player.fakeMethod();

  const player2 = GetPlayer(2);
  player2?.test('hello world');
}, 1000);
