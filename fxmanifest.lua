fx_version 'cerulean'
game 'gta5'

author 'You'
version '1.0.0'

lua54 'yes'

client_script 'dist/client.js'
server_script 'dist/server.js'

server_scripts { '@ox_lib/init.lua', 'lib/server.lua' }
