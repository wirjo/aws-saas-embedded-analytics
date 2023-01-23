/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

// TODO: Dynamically reference dashboardId
const dashboardId = "c0e28463-bc80-469a-902e-7dea43341190";

// TODO: Dynamically generate amplify hosting URL
const amplifyHostingUrl = "https://dev.d3n0e4naafgtwo.amplifyapp.com";

const getEmbedUrl = async (tenantId, awsAccountId) => {
    // Prepare parameters for GenerateEmbedUrlForAnonymousUser on Quicksight API
    // https://docs.aws.amazon.com/quicksight/latest/APIReference/API_GenerateEmbedUrlForAnonymousUser.html
    const params = {
        AwsAccountId: awsAccountId,
        SessionLifetimeInMinutes: 60,
        SessionTags: [ 
            {
                "Key": "tag-tenantId", // Length: [1-128]
                "Value": tenantId // Length: [0-256]
            }
        ],
        Namespace: "default",
        AuthorizedResourceArns: [
            `arn:aws:quicksight:${process.env.AWS_REGION}:${awsAccountId}:dashboard/${dashboardId}`,
        ],
        ExperienceConfiguration: {
            Dashboard : {
                "InitialDashboardId": dashboardId,
            },
        },
        AllowedDomains: [
            'http://localhost:3000/',
            amplifyHostingUrl
        ]
    }
    
    // GenerateEmbedUrlForAnonymousUser
    const { QuickSightClient, GenerateEmbedUrlForAnonymousUserCommand } = require('@aws-sdk/client-quicksight');
    const client = new QuickSightClient({ region: process.env.AWS_REGION }); 
    const command = new GenerateEmbedUrlForAnonymousUserCommand(params);
    const embedUrl = client.send(command);
    return embedUrl;
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
    
    // Get the current awsAccountId from Lambda ARN
    const lambdaFunctionArn = context.invokedFunctionArn;
    const awsAccountId = lambdaFunctionArn.split(':')[4];

    // Get tenantID from URL path /analytics/{tenantId}
    // By default, amplify creates API paths with /{proxy} as the path parameter
    const tenantId = event.pathParameters['proxy'];

    // Get the Embed URL
    const embedUrl = await getEmbedUrl(tenantId, awsAccountId);

    return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify(embedUrl),
    };
};