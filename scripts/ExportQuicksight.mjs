import * as fs from 'fs';
import describeAnalysis from './DescribeAnalysis.mjs';
import describeDataSet from './DescribeDataSet.mjs';

export const exportAnalyses = () => {     
    // Get analysisIds from analysis-list.json using fs
    const analysisList = JSON.parse(fs.readFileSync('exported-resources/analysis-list.json'));
    const analysisIds = analysisList.map(a => a.AnalysisId);
    // For each analysisIds, call describeAnalysis from the Quicksight API
    analysisIds.forEach(async (analysisId) => {
        const analysis = await describeAnalysis(analysisId);
        // Get DataSetId from analysis
        const dataSetId = analysis['Definition']['DataSetIdentifierDeclarations'][0]['DataSetArn'].split('/').pop();
        await describeDataSet(dataSetId);
    });
}

exportAnalyses();