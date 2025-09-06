import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class EcrRepositoryStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR Repository with best practices
    this.repository = new ecr.Repository(this, 'MyEcrRepository', {
      repositoryName: 'my-application-repo',
      encryption: ecr.RepositoryEncryption.KMS, // Enhanced security
      imageScanOnPush: true, // Vulnerability scanning
      imageTagMutability: ecr.TagMutability.MUTABLE, // Prevent tag overwriting
    //   removalPolicy: cdk.RemovalPolicy.RETAIN // Keep repo when stack is deleted
    });

    // Add lifecycle rules for cost optimization
    this.repository.addLifecycleRule({
      description: 'Keep only latest 10 images',
      maxImageCount: 10
    });

    // this.repository.addLifecycleRule({
    //   description: 'Delete images older than 30 days',
    //   maxImageAge: cdk.Duration.days(30)
    // });

    // Output the repository URI
    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'ECR Repository URI'
    });

    new cdk.CfnOutput(this, 'RepositoryName', {
      value: this.repository.repositoryName,
      description: 'ECR Repository Name'
    });
  }
}
