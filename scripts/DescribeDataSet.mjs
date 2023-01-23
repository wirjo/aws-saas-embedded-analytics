import AWS from 'aws-sdk';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const quicksight = new AWS.QuickSight({
  region: process.env.AWS_REGION
});

const describeDataSet = async (dataSetId) => {
  const params = {
    AwsAccountId: process.env.AWS_ACCOUNT_ID,
    DataSetId: dataSetId,
  }
  const data = await quicksight.describeDataSet(params).promise();
  fs.writeFileSync(`exported-resources/DataSet-${dataSetId}.json`, JSON.stringify(data, null, 2));
  return data;
}

export default describeDataSet;