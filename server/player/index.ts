import 'player/events';

setTimeout(async () => {
    const player = exports.ox.getOxPlayer(1);
  
    if (!player) return;
  
    exports.ox.callOxPlayer(1, 'test', 'hello', 'world');
    exports.ox.callOxPlayer(1, 'setAsJoined');
    exports.ox.callOxPlayer(1, 'fakeMethod');
    exports.ox.callOxPlayer(2, 'test');
  }, 1000);
  