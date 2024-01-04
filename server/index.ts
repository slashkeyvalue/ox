import { OxPlayer } from "player";

const player = new OxPlayer(1);
new OxPlayer(2);
const expplayer = exports.ox.GetOxPlayer(2);

console.log(player);

player.print(1, 2);
console.log(expplayer);
expplayer.call("print", "a", "b");

const player2 = OxPlayer.get(2);
console.log(player.getUserId(), player2.getUserId())

const expmember = exports.ox.GetPlayer(2);
const players = OxPlayer.getAll();

member.publicmethod(1, 2);
console.log("players", players);
expmember.call("publicmethod", "a", "b");

console.log(player.source)
console.log(player.userId)
console.log(OxPlayer.getFromUserId(player.userId))