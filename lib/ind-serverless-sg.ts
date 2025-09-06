import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface SGStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class SGStack extends cdk.Stack {
  public readonly vpclink_sg : ec2.SecurityGroup;
  public readonly ecs_service_sg : ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props: SGStackProps) {
    super(scope, id, props);

    this.vpclink_sg = new ec2.SecurityGroup(this, 'vpcLink-SG', {
      vpc: props.vpc,
      description: 'Security group for VPC Link',
      allowAllOutbound: true,
    });

    this.ecs_service_sg = new ec2.SecurityGroup(this, 'Ecs-service-SG', {
      vpc: props.vpc,
      description: 'Security group for ECS service',
      allowAllOutbound: true,
    });

    this.ecs_service_sg.addIngressRule(
      this.vpclink_sg,
      ec2.Port.tcp(80), 
      'Allow inbound traffic from VPC Link to ECS service'
    );
  }
}
