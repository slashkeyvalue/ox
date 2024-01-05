import { OxPlayer } from "player/class";

const connectingPlayers: Dict<OxPlayer> = {};

async function loadPlayer(playerId: number) {
  const player = new OxPlayer(playerId);
  await player.loadPlayerData();

  return player;
}

on("playerConnecting", async () => {
  const tempId = source || 68;
  const player = await loadPlayer(tempId);
  connectingPlayers[tempId] = player;
});

on("playerJoining", async (tempId: string) => {
  const playerId = source || 69;
  const player = connectingPlayers[tempId];
  player.setAsJoined(playerId);
});

on("playerDropped", () => {
  OxPlayer.remove(source);
});

on("onResourceStop", (resource: string) => {
  if (resource === "ox") {
    Object.values(OxPlayer.getAll()).forEach((player) => {
      console.log(player);
    });
  }
});

setTimeout(() => {
  getPlayers().forEach(async (value) => {
    console.log(value);
    const player = await loadPlayer(parseInt(value));
    player.setAsJoined();
  });
});
