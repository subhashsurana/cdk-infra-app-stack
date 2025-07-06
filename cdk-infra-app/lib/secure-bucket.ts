import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';

//Define the properties for the SecureBucket construct. You can extend the standard BucketProps 
// and just omit the properties you are setting by default.
export interface SecureBucketProps extends Omit<s3.BucketProps, 'encryption' | 'versioned' | 'blockPublicAccess' | 'removalPolicy'> {
    deploymentEnvironment?: string; // Optional property to specify the deployment environment
    // You can add more properties as needed
    // For example, you might want to add properties for logging, lifecycle rules, etc.
    // Just ensure that you do not override the properties you are setting by default.
}

// Define the new SecureBucket construct class that extends the Construct Class.

export class SecureBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: SecureBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'SecureBucket', {
      ...props, // Spread the props to allow additional properties to be passed
      encryption: s3.BucketEncryption.S3_MANAGED, // Use S3 managed encryption by default
//      bucketName: `secure-bucket-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}-${props?.deploymentEnvironment || 'default'}`,
      // Ensure the bucket name is unique and includes the account and region   
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Change to DESTROY for dev/test environments
    });
  }
}
