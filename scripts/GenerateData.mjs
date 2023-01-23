import { faker } from '@faker-js/faker';
import * as fastCsv from 'fast-csv';
import * as fs from 'fs';

export const GenerateData = () => {

  // Generate fake users
  const nUsers = 5000;
  const users = [];
  for (let i = 1; i <= nUsers; i++) {
    users.push({
      id: i,
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lasttName: faker.name.lastName(),
      email: faker.internet.email(),
      birthdate: faker.date.birthdate(),
    });
  }

  // Generate fake transaction data
  const nTenants = 100;
  const nTransactions = 100000;
  const transactions = [];
  for (let i = 1; i <= nTransactions; i++) {
    const tenantId = faker.datatype.number({ min: 1, max: nTenants });
    transactions.push({
      id: i,
      tenantId: tenantId,
      terminalId: `${tenantId}-t-${faker.datatype.number({ min: 1, max: 20 })}`,
      type: faker.helpers.arrayElement(["debit", "credit", "eftpos", "bnpl", "other"]),
      amount: faker.finance.amount(0, 1000, 2),
      // exclude comma in string to avoid CSV parsing issues
      merchantName: faker.company.name().replace(",", ""),
      purchase: faker.commerce.productName(),
      purchaseType: faker.commerce.department(), 
      timestamp: faker.date.recent(90).toISOString().slice(0, 19).replace('T', ' '),
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
    });
  }

  // Write users data to CSV file
  // Create the folder if it doesn't exist
  if (!fs.existsSync("./sample-data/users")) {
    fs.mkdirSync("./sample-data/users");
  }
  const usersStream = fs.createWriteStream("./sample-data/users/users.csv");
  fastCsv.write(users, { headers: true }).pipe(usersStream);

  // Write transactions data to CSV file
  // Create the folder if it doesn't exist
  if (!fs.existsSync("./sample-data/transactions")) {
    fs.mkdirSync("./sample-data/transactions");
  }
  const transactionStream = fs.createWriteStream("./sample-data/transactions/transactions.csv");
  fastCsv.write(transactions, { headers: true }).pipe(transactionStream);
}

GenerateData();