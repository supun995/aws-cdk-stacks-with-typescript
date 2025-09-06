import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class IndServerlessVpcStack extends cdk.Stack {
  public readonly ind_vpc: ec2.Vpc;
  public readonly privateSubnets: ec2.ISubnet[];
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.ind_vpc = new ec2.Vpc(this, 'Ind_Vpc', {
        vpcName : 'Ind_Vpc',
        maxAzs: 2,
        createInternetGateway : true,
        natGateways : 1,
        enableDnsSupport : true,
        restrictDefaultSecurityGroup : false,
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        subnetConfiguration : [
            {
                cidrMask: 24,
                name: 'PublicSubnet',
                subnetType: ec2.SubnetType.PUBLIC,
            },
            {
                cidrMask: 24,
                name: 'PrivateSubnet',
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
        ]
    });
  }
}