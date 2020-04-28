#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { KisCloudStack } = require('../lib/kis-cloud-stack');
const { KisCloudIISStack } = require('../lib/kis-cloud-iis');

const app = new cdk.App(process.argv);

new KisCloudIISStack(app, 'KisCloudStack-IIS-1', {
    env: {
        "ddfdf":"xxx";
        'account': 'XXXXXXXXXXXX',
        'region': 'cn-northwest-1'
    },
    vpc: { 'vpcId': 'vpc-XXXXXXXXXXXX' },
    // cfnName:'KIS-VPC',
    tags: { 'PROD': 'KisCloud-1', 'PID': 'IIS', 'ENV': 'PROD' },
    publicCidrBlock1: '10.215.5.32/27',
    publicCidrBlock2: '10.215.6.32/27',
    iGatewayId: 'igw-0524838956f9448c3',
    iisIamName: 'eas cloud container',
    iisRole: 'arn:aws-cn:iam::XXXXXXXXXXXX:instance-profile/ec2-log-role',
    iisInstanceType: 'c5.large',
    iisSecurityGroupId: 'sg-007a130aa36470168',
    keyName: 'poc-zhnc',
    subnets: [{ subnetId: 'subnet-0070e331a8bb50e0f' }, { subnetId: 'subnet-0abd84fb4886391e6' }]
});

// 10.215.0.0/21
new KisCloudStack(app, 'KisCloudStack-UE-1', {
    env: {
        'account': 'XXXXXXXXXXXX',
        'region': 'cn-northwest-1'
    },
    vpc: { 'vpcId': 'vpc-XXXXXXXXXXXX' },
    // cfnName:'KIS-VPC',
    tags: { 'PROD': 'KisCloud-1', 'PID': 'UE-1', 'ENV': 'PROD' },
    privateCidrBlock1: '10.215.5.0/27',
    privateCidrBlock2: '10.215.6.0/27',
    natGatewayId: 'nat-08737f8f0a68ad52b',
    rdpIamName: 'nginx1.1',
    rdpRole: 'arn:aws-cn:iam::XXXXXXXXXXXX:instance-profile/ec2-log-role',
    rdpInstanceType: 'c5.large',
    rdpSecurityGroupId: 'sg-0c2956e0ac9e346c9',
    keyName: 'poc-zhnc',
    PID: 'UE-1'

});



app.synth();
