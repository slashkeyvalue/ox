import { OxPlayer } from "player";
import { OxVehicle } from "vehicle";

const player = new OxPlayer(1);
new OxPlayer(2);
const expplayer = exports.ox.GetOxPlayer(2);

console.log(player);

player.print(1, 2);
console.log(expplayer);
expplayer.call("print", "a", "b");

const player2 = OxPlayer.get(2);
console.log(player.getUserId(), player2.getUserId())

const vehicle = new OxVehicle(333);
const players = OxPlayer.getAll();

console.log(vehicle);
console.log("players", players);
console.log("vehicles", OxVehicle.getAll());
console.log(vehicle.getVehicleId())

console.log(player.source)
console.log(player.userId)
console.log(OxPlayer.getFromUserId(player.userId))