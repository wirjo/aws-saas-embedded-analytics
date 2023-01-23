import AWS from 'aws-sdk';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { updateDataSet } from './UpdateDataSet.mjs';
dotenv.config();

const quicksight = new AWS.QuickSight({
  region: process.env.AWS_REGION
});

export const updateAnalysis = async (analysisId) => {

  let analysisData = { };

  fs.readFile(`exported-analysis/analysis-${analysisId}.json`, (err, data) => {   
      if (err) return console.error(err);

      const analysis = JSON.parse(data);

      let params = {
        AwsAccountId: process.env.AWS_ACCOUNT_ID,
        AnalysisId: analysisId,
      };
      params = { ...analysis, ...params };

      // Exclude unnecessary parameters
      delete params['Status'];
      delete params['ResourceStatus'];
      delete params['RequestId'];

      quicksight.updateAnalysis(params, (err, data) => {
          if (err) {
            console.error(err);
            return;
          }
          analysisData.response = data;
      });

      const dataSetArn = analysis['Definition']['DataSetIdentifierDeclarations'][0]['DataSetArn'];
      const dataSetId = dataSetArn.split('/').pop();
      analysisData.DataSetId = dataSetId;
  });

  return analysisData;
}