import { OnPlayerLoaded, OnPlayerLogout } from '../player';

SetConvar('npwd:useResourceIntegration', 'true');
SetConvar(
  'npwd:database',
  JSON.stringify({
    playerTable: 'characters',
    identifierColumn: 'charId',
    phoneNumberColumn: 'phoneNumber',
  })
);

OnPlayerLoaded('npwd', (player) => {
  exports.npwd.newPlayer({
    source: player.source,
    identifier: player.charId,
    phoneNumber: player.get('phoneNumber'),
    firstname: player.get('firstName'),
    lastname: player.get('lastName'),
  });
});

OnPlayerLogout((player) => exports.npwd.unloadPlayer(player.source));
