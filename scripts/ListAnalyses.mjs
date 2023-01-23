import AWS from 'aws-sdk';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const quicksight = new AWS.QuickSight({
  region: process.env.AWS_REGION
});

const listAnalyses = async () => {
  const params = {
    AwsAccountId: process.env.AWS_ACCOUNT_ID,
  }
  const data = await quicksight.listAnalyses(params).promise();
  // Filter out deleted resources
  const analysisSummaryListFiltered = data.AnalysisSummaryList.filter(a => a.Status != 'DELETED');
  fs.writeFileSync(`exported-resources/analysis-list.json`, JSON.stringify(analysisSummaryListFiltered, null, 2));
}

listAnalyses();

export default listAnalyses;