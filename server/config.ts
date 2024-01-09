export * from '../common/config';

export const PRIMARY_IDENTIFIER = GetConvar('ox:primaryIdentifier', 'license2');

// Set ox_inventory convars
SetConvarReplicated('inventory:framework', 'ox');
SetConvarReplicated('inventory:trimplate ', 'false');
