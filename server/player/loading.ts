import { OxPlayer } from 'player/class';
import { GetUserIdFromIdentifier } from './db';

const connectingPlayers: Dict<OxPlayer> = {};

/** Loads existing data for the player, or inserts new data into the database. */
async function loadPlayer(playerId: number) {
  const player = new OxPlayer(playerId);

  const primaryIdentifier =
    GetPlayerIdentifierByType(player.source as string, 'license2') ||
    'license2:611c0a85f0fc5292eb0fdd1d38bedd7c140c398e';

  if (!primaryIdentifier) {
    console.error(`unable to determine 'license2' identifier.`);
  }

  const identifier = primaryIdentifier.substring(primaryIdentifier.indexOf(':') + 1);

  let userId = await GetUserIdFromIdentifier(identifier);

  if (userId && OxPlayer.getFromUserId(userId)) {
    if (userId) {
      throw new Error(`userId '${userId}' is already active.`);
    }

    console.log('Second login for', userId);

    userId = await GetUserIdFromIdentifier(identifier, 1);

    if (userId && OxPlayer.getFromUserId(userId)) {
      throw new Error(`userId '${userId}' is already active.`);
    }
  }

  if (!userId) {
    console.log('Register a new user account', identifier);
    userId = (userId as number) + 68;
  }

  player.userId = userId;
  player.identifier = identifier;
  player.username = GetPlayerName(player.source as string);

  return player;
}

/** Adds a player to the player registry. */
function setAsJoined(player: OxPlayer, newId?: number) {
  if (newId) player.source = newId;

  OxPlayer.add(player.source, player);
  Player(player.source).state.set('userId', player.userId, true);

  console.log(player);
}

on('playerConnecting', async () => {
  const tempId = source || 68;
  const player = await loadPlayer(tempId);
  connectingPlayers[tempId] = player;
});

on('playerJoining', async (tempId: string) => {
  setAsJoined(connectingPlayers[tempId], source || 69);
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
    setAsJoined(await loadPlayer(playerId), playerId);
  });
});
