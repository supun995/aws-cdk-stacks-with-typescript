import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class GitHubOIDCStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the OIDC Provider if it doesn't exist
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: [
        '2b18947a6a9fc7764fd8b5fb18a863b0c6dac24f' // GitHub Actions OIDC thumbprint
      ],
    });

    // Create the IAM role with the specified trust policy
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'github-actions-role', // Customize role name as needed
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': 'repo:supun995/ecs-backend-deployment-demo:*', // Replace org/repo with your values
          },
        }
      ),
    });

    // Add required permissions to the role
    // Example: Adding S3 read access - modify according to your needs
    githubActionsRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImag',
          'ecr:CompleteLayerUpload',
          'ecr:GetAuthorizationToken',
          'ecr:UploadLayerPart',
          'ecr:ListImages',
          'ecr:InitiateLayerUpload',
          'ecr:BatchCheckLayerAvailability',
          'ecr:PutImage',
          // Add other required permissions here
        ],
        resources: ['*'], // Restrict this to specific resources as needed
      })
    );

    // Alternative method: Create an inline policy
    const customPolicy_1 = new iam.Policy(this, 'CustomPolicy_1', {
      policyName: 'ECSUpdatePolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
          'ecs:DeregisterTaskDefinition',
          'ecs:UpdateService',
          'ecs:RegisterTaskDefinition',
          'ecs:DescribeServices',
          ],
          resources: ['*'],
        }),
      ],
    });

    // Alternative method: Create an inline policy
    const customPolicy_2 = new iam.Policy(this, 'CustomPolicy_2', {
      policyName: 'PassRolePolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
          'iam:PassRole',
          ],
          resources: ['*'],
        }),
      ],
    });

    // Attach the inline policy to the role
    githubActionsRole.attachInlinePolicy(customPolicy_1);
    githubActionsRole.attachInlinePolicy(customPolicy_2);

    // Output the Role ARN
    new cdk.CfnOutput(this, 'RoleArn', {
      value: githubActionsRole.roleArn,
      description: 'ARN of the GitHub Actions IAM Role',
    });
  }
}

