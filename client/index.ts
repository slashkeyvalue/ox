import { PLATE_FORMAT } from 'config';

export * from '../common';

for (let i = 0; i < GetNumberOfVehicleNumberPlates(); i++) {
  SetDefaultVehicleNumberPlateTextPattern(i, PLATE_FORMAT);
}
