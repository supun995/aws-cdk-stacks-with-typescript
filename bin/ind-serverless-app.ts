#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkForServerlessStack } from '../lib/ind-serverless-app-stack';
import { IndServerlessVpcStack } from '../lib/ind-serverless-networking';
import { IndServerlessECSStack } from '../lib/ind-serverless-ecs';
import { IndServerlessHttpApiGwStack } from '../lib/ind-serverless-httpApiGw';
import { SGStack } from '../lib/ind-serverless-sg';
import { EcrRepositoryStack } from '../lib/ind-serverless-ecr';
// import { IndServerlessCmpStack } from '../lib/ind-serverless-cloudmap';
import { GitHubOIDCStack } from '../lib/ind-serverless-iam';

const app = new cdk.App();

const env = {
  account: 'xxxxxxxxxxxxxx',
  region: 'ap-southeast-1',
};

new CdkForServerlessStack(app, 'CdkForServerlessStack', {
  // env: { account: 'xxxxxxxxxxxxxx', region: 'ap-southeast-1' },
  env: env,
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

const networkingStack = new IndServerlessVpcStack(app, 'IND-VPC-DEV-STACK', {
  env: env,
});

const sgstack  = new SGStack(app, 'IND-SG-DEV-STACK', {
  env: env,
  vpc: networkingStack.ind_vpc,
});


// const cloudmapstack = new IndServerlessCmpStack(app, 'IND-CLOUDMAP-DEV-STACK', {
//   env: env,
//   vpc: networkingStack.ind_vpc,
// });

const EcsStack = new IndServerlessECSStack(app, 'IND-ECS-DEV-STACK', {
  env: env,
  vpc: networkingStack.ind_vpc,
  ecs_service_sg : sgstack.ecs_service_sg
});

const HttpApiGwStack = new IndServerlessHttpApiGwStack(app, 'IND-HTTPAPIGW-DEV-STACK', {
  env: env,
  vpc: networkingStack.ind_vpc,
  cloudMapService : EcsStack.cloudMapService,
  vpclink_sg : sgstack.vpclink_sg
});

const EcrRepositorystack = new EcrRepositoryStack(app, 'IND-ECR-DEV-STACK', {
  env: env
});

new GitHubOIDCStack(app, 'GitHubOIDCStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});