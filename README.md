# aws-saas-embedded-analytics

Embed analytics dashboards on a multi-tenant SaaS application on AWS using Amazon QuickSight and AWS Amplify. 

This repository aims to accelerate adoption of customer-facing interactive analytics so that organisations can offer personalised, differentiated and data-rich experiences to its users. The implementation avoids complexities typically associated with managing infrastructure, scalability, and user identity and access.  

For more information on embedded analytics, please see [blog post](https://aws.amazon.com/blogs/big-data/embed-multi-tenant-dashboards-in-saas-apps-using-amazon-quicksight-without-provisioning-or-managing-users/) or [video presentation](https://www.youtube.com/watch?v=MvDQuTvI4as).

## Overview

This open-source repository is written in Node.js and powered by AWS Amplify, a framework to build modern full-stack applications on AWS. It contains extensible sample code for demonstrative purposes only and is **not** production-ready. 

### Application
It includes a full-stack application with:

* **Front-end:** React application to display embedded analytics using [Amazon QuickSight Embedding SDK](https://github.com/awslabs/amazon-quicksight-embedding-sdk), including simulation on how to display dashboards for a particular SaaS tenant.
* **Back-end:** Serverless API to generate appropriate embed URL.

### AWS Resources
The app also sets up the necessary underlying AWS resources. It uses [AWS CDK as custom resources in AWS Amplify](https://docs.amplify.aws/cli/custom/cdk/) to automate deployment. These resources are defined in [/amplify/backend/custom/](/amplify/backend/custom/). 

* **Business Intelligence with Amazon QuickSight:** QuickSight is set up with a dataset connector to an S3 data lake via Amazon Athena, appropriate tag-based row-level seucrity (RLS) and a sample dashboard for embedding. The QuickSight resources include:

  * [Dataset](https://docs.aws.amazon.com/quicksight/latest/user/creating-data-sets.html) with Amazon Athena as the data source to query the data in the Amazon S3 data lake.
    * This includes importing to [SPICE](https://docs.aws.amazon.com/quicksight/latest/user/spice.html) for query performance and caching.
  * [Analysis](#todo) with a pre-designed visuals and insights for publishing.
  * [Dashboard](#todo) published from Analysis for embedding.

### Utilities

The repository also contains utility scripts: 

* **Export QuickSight:** Sample scripts to export configuration of your QuickSight using the `Describe` endpoints in QuickSight API in order to generate `json` object files for deployment.  
* **Generation of Fake Data:** Sample scripts to generate sample data using [Faker.js](https://fakerjs.dev/) for demonstrative and proof-of-concept purposes.  
* **Data Lake:** A simple data lake set up with AWS Lake Formation with sample financial transactions data stored on Amazon S3.

## Prerequisites

* Git v2.37 or later
* AWS Account
* Node.js v18.x or later
* npm v9.2.x or later
* [AWS Amplify](https://docs.amplify.aws/start/q/integration/react/)

## Instructions

* Ensure that you have the necessary [pre-requisites](#Prerequisites).
* [Set up AWS Amplify](https://docs.amplify.aws/start/getting-started/installation/q/integration/react/) including Amplify CLI and connection to an AWS account
* Install packages by running `npm run install`
* Run `amplify serve` to set up AWS resources and run the application on your local environment

Once set up, try input various `tenantId` to see your embedded dashoards change according to the particular tenant.

## How it works

Amazon QuickSight supports [tag-based row-level security (RLS)](https://docs.aws.amazon.com/quicksight/latest/user/quicksight-dev-rls-tags.html) which can be applied to a QuickSight dataset. In this example, we have set up tagging based on the `tenantId` column of the data.

Once the tag-based RLS is set up for the dataset, we can call the [GenerateEmbedUrlForAnonymousUser](https://docs.aws.amazon.com/quicksight/latest/APIReference/API_GenerateEmbedUrlForAnonymousUser.html) API to generate a  a short-lived URL for embedding. The API call uses the `SessionTags` parameter to generate the URL for the specific `tenantId` on-the-fly upon request. For security, you can also configure the `SessionLifetimeInMinutes` and `AllowedDomains` parameter upon request. This logic is in the serverless backend on AWS Lambda - see [/amplify/backend/function/analytics/index.js](/amplify/backend/function/analytics/index.js). 

The Lambda function is on the Node.js v18 runtime which has AWS SDK v3 by default and has been configured to have the appropriate IAM permissions to access be able to talk to the QuickSight - see [IAM Permissions required to access QuickSight APIs](#Appendix-IAM-Permissions-required-to-access-QuickSight-APIs).

### Security

In this example, the application including serverless API is unprotected and publicly accessible for demonstrative purposes only. In practice, these should be protected and you should [add authentication to the application](https://docs.amplify.aws/cli/auth/overview/).

## Helper Scripts

### Setting up a simple data lake

For demonstrative purposes, we are using [Faker.js](https://fakerjs.dev/) to generate sample financial data.  To generate the sample data, run:

```
npm run generate-data
```

You can then upload this to your data lake by storing in it an S3 bucket. The command below will automate the uploading to an S3 bucket `aws-demo-financial-data-{AWS_ACCOUNT_ID}`.

```
npm run upload-data-to-s3
```

In practice, you may use services such as [Blueprints in Lake Formation](https://aws.amazon.com/blogs/big-data/building-securing-and-managing-data-lakes-with-aws-lake-formation/) or AWS Data Migration Services (DMS) to automatically ingest this data from your operational databases and other data sources.

#### AWS Lake Formation - Build, manage, and secure data lakes

AWS Lake Formation is a fully managed service used to build, manage, and secure data lakes. In this example, we can set up Lake Formation to:

* [Add an Amazon S3 location to your data lake](https://docs.aws.amazon.com/lake-formation/latest/dg/register-data-lake.html)
* Create tables using a [Glue Crawler](https://docs.aws.amazon.com/lake-formation/latest/dg/creating-tables.html) to populate the [Glue Data Catalog](https://docs.aws.amazon.com/lake-formation/latest/dg/populating-catalog.html) with tables and its associated schema. 

To automate this, run:

```
npm run setup-lake-formation
```

If successful, you should see the `transactions` table in your Glue Data Catalog.

### Embedded Analytics with QuickSight

We can use the [Amazon QuickSight Embedding SDK](https://github.com/awslabs/amazon-quicksight-embedding-sdk) to embed QuickSight dashboards into applications. To demonstrate this in action, you can run the sample react app on your local environment:

```
npm run dev
```

To simulate retrieval of a particular tenant's embedded analytics, change the `tenantId` field. In practice, your application can handle the tenant selection based on the user identity.


### Exporting QuickSight  

In order to align with DevOps and CI/CD practices, you can export your QuickSight analysis and dataset to a JSON metadata format using the [DescribeAnalysis]() and [DescribeDataSet]() endpoints in the QuickSight API. 

Try the below command to generate `.json` files under `/exports/`

```
npm run export-quicksight
```

You can then import these `.json` parameters using: 

```
npm run import-quicksight
```

When importing, the `Update` or `Create` endpoints (if it does not already exist) can be used. Note that the endpoints does not support partial updates and unnecessary parameters from the `Describe` response will need to be removed.
### Appendix
#### Appendix: IAM Permissions required to access QuickSight APIs

* Lambda requires [IAM permissions](https://docs.aws.amazon.com/quicksight/latest/user/embedded-analytics-dashboards-with-anonymous-users-step-1.html) to access to QuickSight. This is implemented on [analytics-cloudformation-tempalte.json](/amplify/backend/function/analytics/analytics-cloudformation-template.json) as a modification to the automatically-generated CloudFormation by AWS Amplify.

```
{
  "Action": "quicksight:GetDashboardEmbedUrl",
  "Resource": [
    "arn:aws:quicksight:${region}:${account}:dashboard/*",
    "arn:aws:quicksight:${region}:${account}:namespace/default",
  ],
  "Effect": "Allow"
},
```
