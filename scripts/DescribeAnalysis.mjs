import AWS from 'aws-sdk';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const quicksight = new AWS.QuickSight({
  region: process.env.AWS_REGION
});

const describeAnalysis = async (analysisId) => {
  const params = {
    AwsAccountId: process.env.AWS_ACCOUNT_ID,
    AnalysisId: analysisId
  }
  const data = await quicksight.describeAnalysisDefinition(params).promise();
  fs.writeFileSync(`exported-resources/Analysis-${analysisId}.json`, JSON.stringify(data, null, 2));
  return data;
}

export default describeAnalysis;