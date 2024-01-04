import { OxPlayer } from "player/class";
import { OxVehicle } from "vehicle";
import "player/events";

setTimeout(() => {
    console.log(OxPlayer.getAll())
    console.log(exports.ox.getOxPlayers())
}, 1000)