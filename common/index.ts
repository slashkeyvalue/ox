export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms, null));
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
