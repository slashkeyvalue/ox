import { onClientCallback } from '@overextended/ox_lib/server';
import { NewCharacter, OxPlayer } from './class';

type ScopeEvent = { player: string; for: string };

on('playerEnteredScope', (data: ScopeEvent) => {
  const player = OxPlayer.get(data.for);

  if (player) player.getPlayersInScope()[data.player] = true;
});

on('playerLeftScope', (data: ScopeEvent) => {
  const player = OxPlayer.get(data.for);

  if (player) delete player.getPlayersInScope()[data.player];
});

onClientCallback('ox:setActiveCharacter', async (playerId, data: number | NewCharacter) => {
  const player = OxPlayer.get(playerId);

  if (!player) return;

  const character = player.setActiveCharacter(data);

  return [player.source, character];
});

onClientCallback('ox:deleteCharacter', async (playerId, charId) => {
  const player = OxPlayer.get(playerId);

  if (!player) return;

  return await player.deleteCharacter(charId);
});
