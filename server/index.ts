import { OxPlayer, PlayerRegistry } from "player";

const member = new OxPlayer(1);
new OxPlayer(2);

console.log(member);

const expmember = exports.ox.GetPlayer(2);

member.publicmethod(1, 2);
console.log(expmember);
expmember.call("publicmethod", "a", "b");
