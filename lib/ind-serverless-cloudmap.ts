// import * as cdk from 'aws-cdk-lib';
// import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
// import { Construct } from 'constructs';
// import * as ec2 from 'aws-cdk-lib/aws-ec2';
// // import * as sqs from 'aws-cdk-lib/aws-sqs';

// interface CmpStackProps extends cdk.StackProps {
//   vpc: ec2.IVpc;
// }

// export class IndServerlessCmpStack extends cdk.Stack {
//   public readonly namespace: servicediscovery.PrivateDnsNamespace;
//   constructor(scope: Construct, id: string, props: CmpStackProps) {
//     super(scope, id, props);

//     // Create Private DNS Namespace
//     this.namespace = new servicediscovery.PrivateDnsNamespace(this, 'ServiceDiscoveryNamespace', {
//       name: 'myapp.local',
//       vpc: props.vpc,
//       description: 'Private namespace for microservices'
//     });

//     // Create Cloud Map Service
//     const cmpservice = this.namespace.createService('ServiceDiscovery', {
//       name: 'myservice',
//       description: 'Service discovery for my application',
//       dnsRecordType: servicediscovery.DnsRecordType.A,
//       dnsTtl: cdk.Duration.seconds(60),
//       routingPolicy: servicediscovery.RoutingPolicy.WEIGHTED,
//       customHealthCheck: {
//         failureThreshold: 1
//       }
//     });
//   }
// }
