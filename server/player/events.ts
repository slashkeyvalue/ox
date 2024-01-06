import { OxPlayer } from 'player/class';

const connectingPlayers: Dict<OxPlayer> = {};

async function loadPlayer(playerId: number) {
  const player = new OxPlayer(playerId);
  await player.loadPlayerData();

  return player;
}

on('playerConnecting', async () => {
  const tempId = source || 68;
  const player = await loadPlayer(tempId);
  connectingPlayers[tempId] = player;
});

on('playerJoining', async (tempId: string) => {
  OxPlayer.setAsJoined(connectingPlayers[tempId], source || 69);
});

on('playerDropped', () => {
  OxPlayer.remove(source);
});

on('onResourceStop', (resource: string) => {
  if (resource === 'ox') {
    Object.values(OxPlayer.getAll()).forEach((player) => {
      console.log(player);
    });
  }
});

setTimeout(() => {
  getPlayers().forEach(async (playerSrc) => {
    const playerId = parseInt(playerSrc);
    OxPlayer.setAsJoined(await loadPlayer(playerId), playerId);
  });
});
