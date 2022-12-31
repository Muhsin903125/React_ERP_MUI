import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const invoiceitems = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid(),
  // avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
  name: faker.vehicle.vehicle(),
  unit: sample(['NOS','LS','PCS']),
  qty: sample([1,2,3,4]),
  rate: sample([1000,50000,3987,787879]),
  amount: sample([79857,54354,5454,52345]),
  isVerified: faker.datatype.boolean(),
}));

export default invoiceitems;
