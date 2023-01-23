import AWS from 'aws-sdk';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const quicksight = new AWS.QuickSight({
  region: process.env.AWS_REGION
});

const describeDataSource = async (dataSourceId) => {
  const params = {
    AwsAccountId: process.env.AWS_ACCOUNT_ID,
    DataSourceId: dataSourceId,
  }
  const data = await quicksight.describeDataSource(params).promise();
  fs.writeFileSync(`exported-resources/DataSource-${dataSourceId}.json`, JSON.stringify(data, null, 2));
  return data;
}

export default describeDataSource;