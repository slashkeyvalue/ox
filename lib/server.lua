---@class PlayerInterface
---@field source number
---@field userId number
---@field username string
---@field identifier string
local PlayerInterface = lib.class('PlayerInterface')

--[[ Allows player.test(args) instead of player:test(args) but makes a new closure per-method per-player... 
function PlayerInterface:__index(index)
    local value = PlayerInterface[index]

    if value == '<callable>' then
        self[index] = function(...)
            return exports.ox:callOxPlayer(self.source, index, ...)
        end

        return self[index]
    end

    if type(value) == 'function' then
        self[index] = function(...)
            return value(self, ...)
        end

        return self[index]
    end

    return value
end

for method in pairs(exports.ox.getOxPlayerCalls() or {}) do
    PlayerInterface[method] = '<callable>'
end
--]]

function PlayerInterface:localmethod(...)
    print(...)
end

-- Might be preferable to avoid closures, but only allows player:test(args)
for method in pairs(exports.ox.getOxPlayerCalls() or {}) do
    PlayerInterface[method] = function(self, ...)
        return exports.ox:callOxPlayer(self.source, method, ...)
    end
end
--]]

Ox = {}

---@param id string | number
---@return OxPlayer?
function Ox.GetPlayer(id)
    local player = exports.ox:getOxPlayer(id)

    if not player then return warn(string.format('cannot create PlayerInterface<%s> (invalid id)', id)); end

    return PlayerInterface:new(player or { source = tonumber(id) })
end

SetTimeout(1000, function()
    local player = Ox.GetPlayer(1)

    if not player then return end

    print(player)
    print(json.encode(player, { pretty = true, sort_keys = true }))
    player:test('hello', 'world')
    player:localmethod('hello', 'world')

    print(PlayerInterface.test)
    print(player.test)
end)
