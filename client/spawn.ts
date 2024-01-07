import { CHARACTER_SLOTS, DEFAULT_SPAWN } from 'config';
import { Sleep } from '../common';
import { triggerServerCallback } from '@overextended/ox_lib/client';

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
  SetGameplayCamRelativeHeading(0);
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

  while (GetPlayerSwitchState() !== 5) await Sleep(0);

  SwitchInPlayer(playerPed);

  while (GetPlayerSwitchState() !== 12) await Sleep(0);

  SetGameplayCamRelativeHeading(0);

  while (!HasCollisionLoadedAroundEntity(playerPed)) await Sleep(0);

  FreezeEntityPosition(playerPed, false);
}

function CreateCharacterMenu(characters: Partial<Character>[]) {
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
      onSelect: async (index: number) => {
        const input = await exports.ox_lib.inputDialog('Create a character', [
          {
            type: 'input',
            required: true,
            icon: 'user-pen',
            label: 'First name',
            placeholder: 'John',
          },
          {
            type: 'input',
            required: true,
            icon: 'user-pen',
            label: 'Last name',
            placeholder: 'Smith',
          },
          {
            type: 'select',
            required: true,
            icon: 'circle-user',
            label: 'Gender',
            options: [
              {
                label: 'Male',
                value: 'male',
              },
              {
                label: 'Female',
                value: 'female',
              },
              {
                label: 'Non-Binary',
                value: 'non_binary',
              },
            ],
          },
          {
            type: 'date',
            required: true,
            icon: 'calendar-days',
            label: 'Date of birth',
            format: 'YYYY-MM-DD',
            min: '1900-01-01',
            max: '2006-01-01',
            default: '2006-01-01',
          },
        ]);

        if (!input) return exports.ox_lib.showContext('ox:characterSelect');

        const character: NewCharacter = {
          firstName: input[0],
          lastName: input[1],
          gender: input[2],
          date: input[3],
        };

        emitNet('ox:setActiveCharacter', character);
      },
      args: characters.length,
    });
  }

  options.push({
    title: `Delete a character`,
    onSelect: async () => {
      const input = await exports.ox_lib.inputDialog('Delete a character', [
        {
          type: 'select',
          label: 'Select a character',
          required: true,
          options: characters.map((character, index) => {
            return { label: `${character.firstName} ${character.lastName}`, value: index };
          }),
        },
      ]);

      if (!input) return exports.ox_lib.showContext('ox:characterSelect');

      const character = characters[input[0]];
      const deleteChar = await exports.ox_lib.alertDialog({
        header: 'Delete character',
        content: `Are you sure you want to delete ${character.firstName} ${character.lastName}?  \nThis action is irreversible.`,
        cancel: true,
      });

      if (deleteChar === 'confirm') {
        const success = <boolean>await triggerServerCallback('ox:deleteCharacter', 0, character.charId);

        if (success) {
          characters.splice(input[0], 1);
          console.log(characters);
          return CreateCharacterMenu(characters);
        }
      }

      exports.ox_lib.showContext('ox:characterSelect');
    },
  });

  exports.ox_lib.registerContext({
    id: 'ox:characterSelect',
    title: 'Character Selection',
    canClose: false,
    options: options,
  });

  exports.ox_lib.showContext('ox:characterSelect');
}

onNet('ox:startCharacterSelect', async (characters: Partial<Character>[]) => {
  if (playerIsLoaded) {
    playerIsLoaded = false;
    playerIsHidden = true;
  }

  StartCharacterSelect();
  await Sleep(300);
  CreateCharacterMenu(characters);

  // exports.ox_lib.inputDialog('Character Selection', [
  //   {
  //     type: 'select',
  //     options: [ 'test', 'b']
  //   }
  // ])
});

onNet('ox:setActiveCharacter', async (data: Partial<Character>) => {
  const playerPed = PlayerPedId();

  SetEntityHealth(playerPed, GetEntityMaxHealth(playerPed));
  SetPedArmour(playerPed, 0);

  if (data.x) await SpawnPlayer(data.x, data.y, data.z, data.heading, playerPed);

  playerIsLoaded = true;
  playerIsHidden = false;

  TriggerEvent('playerSpawned');
  TriggerEvent('ox:playerLoaded', {} /** todo */);

  // run status system
  // run death system
});
