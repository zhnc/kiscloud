#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { KisCloudStack } = require('../lib/kis-cloud-stack');

const app = new cdk.App();
new KisCloudStack(app, 'KisCloudStack');
