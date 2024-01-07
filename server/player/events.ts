import { onClientCallback } from '@overextended/ox_lib/server';
import { OxPlayer } from './class';

type ScopeEvent = { player: string; for: string };

on('playerEnteredScope', (data: ScopeEvent) => {
  const player = OxPlayer.get(data.for);

  if (player) player.getPlayersInScope()[data.player] = true;
});

on('playerLeftScope', (data: ScopeEvent) => {
  const player = OxPlayer.get(data.for);

  if (player) delete player.getPlayersInScope()[data.player];
});

//todo: callback event
onNet('ox:setActiveCharacter', async (data: number | NewCharacter) => {
  const player = OxPlayer.get(source);

  if (!player) return;

  const character = await player.setActiveCharacter(data);
  emitNet('ox:setActiveCharacter', player.source, character);
});

//todo: callback event
onNet('ox:deleteCharacter', async (charId: number) => {
  const player = OxPlayer.get(source);

  if (!player) return;

  player.deleteCharacter(charId);
});
