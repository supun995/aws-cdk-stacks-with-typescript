import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpServiceDiscoveryIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

interface httpApiGwStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  cloudMapService : servicediscovery.IService;
  vpclink_sg : ec2.SecurityGroup;
}

export class IndServerlessHttpApiGwStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: httpApiGwStackProps) {
    super(scope, id, props);

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'HttpApiWithKindeAuth',
      description: 'HTTP API using Lambda integration',
    });

    // this.vpclink_sg = new ec2.SecurityGroup(this, 'bff_apigw_vpclink_sg', {
    //   vpc: props.vpc,
    //   description: 'Security group for VPC Link',
    //   allowAllOutbound: true,
    // });

    const VpcLink = new apigwv2.VpcLink(this, 'MyVpcLink', {
        vpc : props.vpc,
        securityGroups: [props.vpclink_sg],
        subnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        vpcLinkName : 'MyVpcLink'
    });

    const integration = new HttpServiceDiscoveryIntegration('MyIntegration', props.cloudMapService, {
      vpcLink: VpcLink,
      method: apigwv2.HttpMethod.ANY
    });

    httpApi.addRoutes({
        path: '/{proxy+}',
        methods: [ apigwv2.HttpMethod.ANY ],
        integration: integration,
    });

  }
}
