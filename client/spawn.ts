import { CHARACTER_SLOTS, DEFAULT_SPAWN } from 'config';
import { Sleep } from '../common';

const playerId = PlayerId();

async function StartSession() {
  NetworkStartSoloTutorialSession();

  while (!IsScreenFadedOut()) {
    DoScreenFadeOut(0);
    await Sleep(0);
  }

  if (GetIsLoadingScreenActive()) {
    SendLoadingScreenMessage('{"fullyLoaded": true}');
    ShutdownLoadingScreenNui();
  }

  ShutdownLoadingScreen();
  SetPlayerControl(playerId, false, 0);
  SetPlayerInvincible(playerId, true);
}

setImmediate(StartSession);
emitNet('ox:playerJoined');

let playerIsLoaded = false;
let playerIsHidden = true;

async function StartCharacterSelect() {
  await StartSession();

  let playerPed = PlayerPedId();

  SetEntityCoordsNoOffset(playerPed, DEFAULT_SPAWN[0], DEFAULT_SPAWN[1], DEFAULT_SPAWN[2], true, true, false);
  StartPlayerTeleport(
    playerId,
    DEFAULT_SPAWN[0],
    DEFAULT_SPAWN[1],
    DEFAULT_SPAWN[2],
    DEFAULT_SPAWN[3],
    false,
    true,
    false
  );

  while (!UpdatePlayerTeleport(playerId)) await Sleep(0);

  const camOffset = GetOffsetFromEntityInWorldCoords(playerPed, 0.0, 4.7, 0.2);
  const cam = CreateCameraWithParams(
    'DEFAULT_SCRIPTED_CAMERA',
    camOffset[0],
    camOffset[1],
    camOffset[2],
    0.0,
    0.0,
    0.0,
    30.0,
    false,
    0
  );

  SetCamActive(cam, true);
  RenderScriptCams(true, false, 0, true, true);
  PointCamAtCoord(cam, DEFAULT_SPAWN[0], DEFAULT_SPAWN[1], DEFAULT_SPAWN[2] + 0.1);
  DoScreenFadeIn(300);

  while (IsScreenFadedOut()) await Sleep(0);

  while (!playerIsLoaded) {
    DisableAllControlActions(0);
    ThefeedHideThisFrame();
    HideHudAndRadarThisFrame();

    // if (playerIsHidden) SetLocalPlayerInvisibleLocally(true);

    await Sleep(0);
  }

  SetPlayerControl(playerId, true, 0);
  SetPlayerInvincible(playerId, false);
  RenderScriptCams(false, false, 0, true, true);
  DestroyCam(cam, false);
  SetMaxWantedLevel(0);
  NetworkSetFriendlyFireOption(true);
  SetPlayerHealthRechargeMultiplier(playerId, 0.0);
}

async function SpawnPlayer(x: number, y: number, z: number, heading: number, playerPed: number) {
  DoScreenFadeOut(200);
  
  while (!IsScreenFadedOut()) await Sleep(0);

  SwitchOutPlayer(PlayerPedId(), 0, 1);
  DoScreenFadeIn(300);
  NetworkEndTutorialSession();
  RequestCollisionAtCoord(x, y, z);
  SetEntityCoordsNoOffset(playerPed, x, y, z, false, false, false);
  SetEntityHeading(playerPed, heading);
  FreezeEntityPosition(playerPed, true);
  SetGameplayCamRelativeHeading(0);

  while (GetPlayerSwitchState() !== 5) await Sleep(0);

  SwitchInPlayer(playerPed);

  while (GetPlayerSwitchState() !== 12) await Sleep(0);
  while (!HasCollisionLoadedAroundEntity(playerPed)) await Sleep(0);

  FreezeEntityPosition(playerPed, false)
}

onNet('ox:startCharacterSelect', async (characters: Partial<Character>[]) => {
  if (playerIsLoaded) {
    playerIsLoaded = false;
    playerIsHidden = true;
  }

  StartCharacterSelect();
  await Sleep(300);

  const options: object[] = new Array(characters.length);

  characters.forEach((character, index) => {
    const coords = character.x ? [character.x, character.y, character.z] : DEFAULT_SPAWN;

    options[index] = {
      title: `${character.firstName} ${character.lastName}`,
      description: `${GetLabelText(GetNameOfZone(coords[0], coords[1], coords[2]))}`,
      onSelect: () => {
        emitNet('ox:setActiveCharacter', character.charId);
      },
    };
  });

  if (characters.length < CHARACTER_SLOTS) {
    options.push({
      title: `Empty slot`,
      description: `Create a new character`,
    });
  }

  exports.ox_lib.registerContext({
    id: 'ox:characterSelect',
    title: 'Character Selection',
    canClose: false,
    options: options,
  });

  exports.ox_lib.showContext('ox:characterSelect');

  // exports.ox_lib.inputDialog('Character Selection', [
  //   'hello'
  // ])
});

onNet('ox:setActiveCharacter', async (data: Partial<Character>) => {
  console.log(data);

  const playerPed = PlayerPedId();

  SetEntityHealth(playerPed, GetEntityMaxHealth(playerPed));
  SetPedArmour(playerPed, 0);
  await SpawnPlayer(
    data.x || DEFAULT_SPAWN[0],
    data.y || DEFAULT_SPAWN[1],
    data.z || DEFAULT_SPAWN[2],
    data.heading || DEFAULT_SPAWN[3],
    playerPed
  );

  playerIsLoaded = true;
  playerIsHidden = false;

  TriggerEvent('playerSpawned')
  TriggerEvent('ox:playerLoaded', {} /** todo */);

  // run status system
  // run death system
});
