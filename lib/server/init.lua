local ox_core = exports.ox_core

Ox = setmetatable({}, {
    __index = function(self, index)
        self[index] = function(...)
            return ox_core[index](nil, ...)
        end

        return self[index]
    end
})

lib.load('@ox.lib.server.player')

-- SetTimeout(1000, function()
--     local player = Ox.GetPlayer(1) --[[@as PlayerInterface?]]

--     if not player then return end

--     -- pretty print
--     print(player)

--     -- calls an exported method from the ox resource
--     player.test('hello world')

--     -- this one isn't a funcref
--     player.localmethod('goodbye world')

--     -- methods are bound to the instance after being called
--     for k, v in pairs(player) do
--         print(k, v)
--     end
-- end)
