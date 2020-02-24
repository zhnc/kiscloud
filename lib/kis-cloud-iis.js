const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const rdpServer = require('./rdpServerAutoScaling');
const elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
const autoscaling = require('@aws-cdk/aws-autoscaling');


class KisCloudIISStack extends cdk.Stack {



  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    this.publicSubnets = [];
    this.vpc = ec2.Vpc.fromLookup(this, id + '_KISVPC', props.vpc);
    // this.eip1 = ec2.CfnEIP(this, id + '_ep1');
    // this.eip2 = ec2.CfnEIP(this, id + '_ep2');

    this.createPublicSubnet(id, props.publicCidrBlock1, props.iGatewayId, 0);
    this.createPublicSubnet(id, props.publicCidrBlock2, props.iGatewayId, 1);

    this.privateSubnets = this.vpc.selectSubnets({ subnets: props.subnets }).subnets;

    this.keyName = props.keyName;
    this.rdpSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, id + '_rdpSecurityGroup1', props.iisSecurityGroupId);


    const lb = new elbv2.NetworkLoadBalancer(this, id + '_iis_nlb', {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: id + '-iis-nlb',
      vpcSubnets: { subnets: this.publicSubnets }
    });

    const listener = lb.addListener(id + '_iis_listener', {
      port: 8288,
    });

    const iisservers = new rdpServer.RdpServerAutoScaling(this, id + '_iis', {
      instanceType: props.iisInstanceType,
      iamName: props.iisIamName,
      role: props.iisRole,
    });

    listener.addTargets(id + '_iis_targets_fleet', {
      port: 8288,
      targets: [iisservers.asg]
    });
  }

  createPublicSubnet(id, cidr, igw, index) {
    const publicSubnet = new ec2.PrivateSubnet(this, id + '_publicSubnet' + index, {
      'availabilityZone': this.vpc.availabilityZones[index],
      vpcId: this.vpc.vpcId,
      cidrBlock: cidr,
    });
    publicSubnet.addRoute('route' + index, {
      routerId: igw,
      routerType: ec2.RouterType.GATEWAY,
    });
    this.publicSubnets.push(publicSubnet);
  }


}

module.exports = { KisCloudIISStack }
