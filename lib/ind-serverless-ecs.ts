import * as cdk from 'aws-cdk-lib';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";

interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  ecs_service_sg : ec2.SecurityGroup;
}

export class IndServerlessECSStack extends cdk.Stack {
  public readonly cloudMapService : servicediscovery.IService;
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "Ind-ECS", {
      vpc: props.vpc,
      clusterName: "Ind-ECS-Cluster",
      enableFargateCapacityProviders : true
    });

    // Create the task execution role
    const taskExecutionRole = new iam.Role(this, 'Ind-ECS-TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role that the ECS tasks can use to call AWS services',
    });

    // Attach the AWS managed policy for ECS task execution
    taskExecutionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role')
    );

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'Ind-ECS-TaskDef', {
      family : 'Ind-ECS-TaskDef',
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: taskExecutionRole,
      runtimePlatform : {
        cpuArchitecture : ecs.CpuArchitecture.X86_64, operatingSystemFamily: ecs.OperatingSystemFamily.LINUX   }
    });

    // Create Log Group
    const logGroup = new logs.LogGroup(this, 'FargateLogGroup', {
      logGroupName: '/ecs/ind-app',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK
    });



    const specificContainer  = taskDefinition.addContainer("Ind-ECS-Container", {
      image: ecs.ContainerImage.fromRegistry("public.ecr.aws/docker/library/httpd:latest"),
      containerName: 'httpd',
      memoryLimitMiB: 512,
      cpu: 256,
      essential: true,
      enableRestartPolicy: true,
      portMappings: [{ containerPort: 80, protocol: ecs.Protocol.TCP , name: 'http' }],
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'aws-ecs',
        logGroup: logGroup,
        mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: cdk.Size.mebibytes(25),
        // logRetention: logs.RetentionDays.ONE_WEEK,
      }),
    });

    const namespace = new servicediscovery.PrivateDnsNamespace(this, 'ServiceDiscoveryNamespace', {
      name: 'myecsapp',
      vpc: props.vpc,
      description: 'Private namespace for microservices'
    });

    // Create the service using the capacity provider strategy
    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      assignPublicIp : false,
      desiredCount : 1,
      securityGroups : [ props.ecs_service_sg ],
      serviceName : 'Ind-cmap-Service',
      availabilityZoneRebalancing : ecs.AvailabilityZoneRebalancing.ENABLED,
      vpcSubnets : {
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      cloudMapOptions : {
        cloudMapNamespace : namespace,
        container : specificContainer,
        containerPort: 80,
        name: 'mycloudmapservice',
        dnsRecordType: servicediscovery.DnsRecordType.SRV,
        dnsTtl: cdk.Duration.seconds(60),
      },
    });

    this.cloudMapService = service.cloudMapService!;
    

  }
}