
export const updateDataSet = (datasetId) => {

    let dataSetData = {};

    fs.readFile(`exported-resources/DataSet-${datasetId}.json`, (err, data) => {   
        if (err) return console.error(err);

        const importDataset = JSON.parse(data);

        // Delete unnecessary parameters
        delete importDataset['DataSet']['Arn'];
        delete importDataset['DataSet']['CreatedTime'];
        delete importDataset['DataSet']['LastUpdatedTime'];
        delete importDataset['DataSet']['ConsumedSpiceCapacityInBytes'];
        delete importDataset['DataSet']['OutputColumns'];
        
        // Prepare parameters for updating the DataSet
        // https://docs.aws.amazon.com/quicksight/latest/APIReference/API_UpdateDataSet.html
        let params = {
            AwsAccountId: process.env.AWS_ACCOUNT_ID
        };

        // Add Tag-Based Row Level Security configuration
        // Documentation: https://docs.aws.amazon.com/quicksight/latest/user/tag-based-row-level-security.html
        const rlsConfig = {
            RowLevelPermissionTagConfiguration: {
                Status: 'ENABLED',
                TagRules: [
                    { 
                        "ColumnName": "tenantid",
                        "MatchAllValue": "*",
                        "TagKey": "tag-tenantId",
                        "TagMultiValueDelimiter": ","
                    }
                ]
            }
        };

        params = { ...importDataset['DataSet'], ...rlsConfig, ...params };

        quicksight.updateDataSet(params, (err, data) => {
            if (err) {
            console.error(err);
            return;
            }
            dataSetData.response = data;
        });
    });

    return dataSetData;
}