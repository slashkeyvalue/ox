export const SV_LAN = GetConvarInt('sv_lan', 0) === 1;
export const DEBUG = SV_LAN || GetConvarInt('ox:debug', 0) === 1;
export const CHARACTER_SLOTS = GetConvarInt('ox:characterSlots', 5);
export const PLATE_FORMAT = GetConvar('ox:plateFormat', '........').toUpperCase();
