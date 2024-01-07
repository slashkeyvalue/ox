export * from '../common';
import { PLATE_FORMAT } from 'config';
import 'spawn';

for (let i = 0; i < GetNumberOfVehicleNumberPlates(); i++) {
  SetDefaultVehicleNumberPlateTextPattern(i, PLATE_FORMAT);
}
