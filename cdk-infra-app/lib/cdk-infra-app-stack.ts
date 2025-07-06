import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecureBucket } from "./secure-bucket"; // Import the SecureBucket construct
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_ssm as ssm } from "aws-cdk-lib";
import { isValidBucketName } from '../lib/utils/bucket-validate';
import * as crypto from 'crypto'; // Import the bucket validation function


export interface CdkInfraAppStackProps extends cdk.StackProps {
  stackName: string;
  envName: string;

}

export class CdkInfraAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkInfraAppStackProps) {
    super(scope, id, props);

    // Use a portion of the CDK's unique ID for the suffix.
    // Cdk.shortStackId extracts a short, unique alphanumeric string from the stack's ARN.
    // const stackArnParts = cdk.Fn.split('/', this.stackId);
    // const uniqueSuffix = cdk.Fn.select(2, stackArnParts);

    // Create an instance of the SecureBucket construct
    const bucketLogicalId = "MyFirstSecureBucket";
    const uniquePathString = `${this.node.path}/${bucketLogicalId}`;
    
    const uniqueSuffix = crypto.createHash('md5')
    .update(uniquePathString) // Use the unique path of the construct
    .digest('hex')
    .substring(0, 8); // Take the first 8 characters of the hash

    const bucketName = (`${props.stackName}-${props.envName}-${uniqueSuffix}`).toLowerCase();

    // Ensure the bucket name is lowercase and follows S3 naming conventions
    if (!isValidBucketName(bucketName)) {
      throw Error(`Invalid bucket name: ${bucketName}. Bucket names must be lowercase and follow S3 naming conventions.`);
    }

    const newBucket = new s3.CfnBucket(this, bucketLogicalId, {
      bucketName: bucketName.toLowerCase(), // Ensure the bucket name is lowercase
      versioningConfiguration: {
      status: 'Enabled',
    },
    publicAccessBlockConfiguration: {
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    },
    });

  

  
// 4. Assign the generated name to the CfnBucket resource.
//    We use an L1 construct property override here.
    // newBucket.addPropertyOverride('BucketName', bucketName.toLowerCase());

    // new cdk.CfnOutput(this, 'GeneratedBucketNameOutput', {
    // value: newBucket.bucketName!, // The '!' tells TypeScript the value won't be null
    // description: 'The final, resolved name of the S3 bucket',
    // });
    // Construct the Hierarchical parameter name
    const parameterName = `/${this.region}/${props?.envName}/${props?.stackName}/${newBucket.bucketName}`;

    new ssm.CfnParameter(this, "SecureBucketParameter", {
      name: parameterName,
      value: `${newBucket.bucketName}`,
      type: ssm.ParameterType.STRING,
      description: `Name of the ${props?.stackName} bucket in ${props?.envName}`,
      tier: ssm.ParameterTier.STANDARD,
    });
  }
}
