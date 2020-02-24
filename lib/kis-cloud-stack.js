const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const rdpServer = require('./rdpServerAutoScaling');

class KisCloudStack extends cdk.Stack {



  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    this.privateSubnets = [];
    this.vpc = ec2.Vpc.fromLookup(this, id + '_KISVPC', props.vpc);

    this.createPrivateSubnet(id, props.privateCidrBlock1, props.natGatewayId, 0);
    this.createPrivateSubnet(id, props.privateCidrBlock2, props.natGatewayId, 1);

    this.vpc.addGatewayEndpoint(id + 's3_endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnets: this.privateSubnets }]
    });

    this.keyName = props.keyName;
    this.rdpSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, id + '_rdpSecurityGroup1', props.rdpSecurityGroupId);

    const rdpservers = new rdpServer.RdpServerAutoScaling(this, id + '_rdp', {
      instanceType: props.rdpInstanceType,
      iamName: props.rdpIamName,
      role: props.rdpRole,
      produceId: props.PID,
      alarm: true
    });
  }

  createPrivateSubnet(id, cidr, nat, index) {
    const privateSubnet = new ec2.PrivateSubnet(this, id + '_privateSubnet' + index, {
      'availabilityZone': this.vpc.availabilityZones[index],
      vpcId: this.vpc.vpcId,
      cidrBlock: cidr,
    });
    privateSubnet.addRoute('route' + index, {
      routerId: nat,
      routerType: ec2.RouterType.NAT_GATEWAY,
    });
    this.privateSubnets.push(privateSubnet);
  }
}

module.exports = { KisCloudStack }
