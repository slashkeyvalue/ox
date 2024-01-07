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

onNet('ox:setActiveCharacter', async (data: number | NewCharacter) => {
  const player = OxPlayer.get(source);

  if (!player) return;

  const character = await player.setActiveCharacter(data);
  emitNet('ox:setActiveCharacter', player.source, character);
});

onClientCallback('ox:deleteCharacter', async (playerId, charId) => {
  const player = OxPlayer.get(playerId);

  if (!player) return;

  return await player.deleteCharacter(charId);
});
