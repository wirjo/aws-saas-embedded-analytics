import { updateAnalysis } from './UpdateAnalysis.mjs';

// Define the analysis ID to import
const analysisId = '9f341d95-6ffd-4aad-9c65-5412938c7ad8';

// Update the analysis
const analysisData = updateAnalysis(analysisId);

// Update the dataset
const dataSetData = updateDataSet(analysisData.DataSetId);