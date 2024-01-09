import 'player/loading';
import 'player/events';
import { OxPlayer } from './class';
import { Sleep } from '../../common';

const playerLoadEvents: Dict<Function> = {};
const playerLogoutEvents: Function[] = [];

/** Triggers a callback when a player is fully loaded, or when the resource starts.  */
export function OnPlayerLoaded(resource: string, cb: (player: OxPlayer) => void) {
  playerLoadEvents[resource] = cb;
}

/** Triggers a callback when a player logs out. */
export function OnPlayerLogout(cb: (player: OxPlayer) => void) {
  playerLogoutEvents.push(cb);
}

on('ox:playerLoaded', (playerId: string | number) => {
  for (const resource in playerLoadEvents) {
    const player = OxPlayer.get(playerId);

    if (player.charId) playerLoadEvents[resource](player);
  }
});

on('onServerResourceStart', async (resource: string) => {
  const event = playerLoadEvents[resource];

  if (!event) return;

  await Sleep(1000)

  const players = OxPlayer.getAll();

  for (const id in players) {
    const player = players[id];

    if (player.charId) event(player);
  }
});

on('ox:playerLogout', (playerId: number) => {
  const player = OxPlayer.get(playerId);

  if (player.charId) for (const i in playerLogoutEvents) playerLogoutEvents[i](player);
});
