export function GetIdentifiers(playerId: number | string) {
  const identifiers: Dict<string> = {};
  playerId = playerId.toString();

  for (let index = 0; index < GetNumPlayerIdentifiers(playerId); index++) {
    const [prefix, identifier] = GetPlayerIdentifier(playerId, index).split(':');

    if (prefix !== 'ip') identifiers[prefix] = identifier;
  }

  return identifiers;
}

export function GetRandomInt(min = 0, max = 9) {
  if (min > max) [min, max] = [max, min];

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function GetRandomChar() {
  return String.fromCharCode(GetRandomInt(65, 90));
}

export function GetRandomAlphanumeric() {
  return GetRandomInt(0, 1) === 1 ? GetRandomChar() : GetRandomInt();
}
