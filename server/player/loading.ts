import { OxPlayer } from 'player/class';
import { CreateUser, GetUserIdFromIdentifier } from './db';
import { GetIdentifiers } from 'utils';

const connectingPlayers: Dict<OxPlayer> = {};

/** Loads existing data for the player, or inserts new data into the database. */
async function loadPlayer(playerId: number) {
  const player = new OxPlayer(playerId);

  const primaryIdentifier = GetPlayerIdentifierByType(player.source as string, 'license2');

  if (!primaryIdentifier) {
    return `unable to determine 'license2' identifier.`;
  }

  const identifier = primaryIdentifier.substring(primaryIdentifier.indexOf(':') + 1);

  let userId = await GetUserIdFromIdentifier(identifier);

  if (userId && OxPlayer.getFromUserId(userId)) {
    if (userId) {
      return `userId '${userId}' is already active.`;
    }

    console.log('Second login for', userId);

    userId = await GetUserIdFromIdentifier(identifier, 1);

    if (userId && OxPlayer.getFromUserId(userId)) {
      return `userId '${userId}' is already active.`;
    }
  }

  player.username = GetPlayerName(player.source as string);
  player.userId = userId ? Number(userId) : await CreateUser(player.username, GetIdentifiers(playerId));
  player.identifier = identifier;

  return player;
}

let serverLockdown: string;

setInterval(() => {
  for (const tempId in connectingPlayers) {
    if (!DoesPlayerExist(tempId)) delete connectingPlayers[tempId];
  }
}, 10000);

on('txAdmin:events:serverShuttingDown', () => {
  serverLockdown = 'The server is about to restart. You cannot join at this time.';
  OxPlayer.saveAll('Server is restarting.');
});

on('playerConnecting', async (username: string, _: any, deferrals: any) => {
  const tempId = source;

  deferrals.defer();

  if (serverLockdown) return deferrals.done(serverLockdown);

  const player = await loadPlayer(tempId);

  if (typeof player === 'string') return deferrals.done(player);

  connectingPlayers[tempId] = player;

  deferrals.done();
});

on('playerJoining', async (tempId: string) => {
  const player = connectingPlayers[tempId];
  delete connectingPlayers[tempId];

  if (serverLockdown) return DropPlayer(source.toString(), serverLockdown);

  player.setAsJoined();
});

on('playerDropped', () => {
  const player = OxPlayer.get(source);

  if (!player) return;

  player.logout(true);
  OxPlayer.remove(player.source);
});

RegisterCommand(
  'saveplayers',
  () => {
    OxPlayer.saveAll();
  },
  true
);

setTimeout(() => {
  getPlayers().forEach(async (playerSrc) => {
    const player = await loadPlayer(parseInt(playerSrc));

    if (typeof player === 'string') return DropPlayer(playerSrc, player);

    player.setAsJoined();
  });
});
