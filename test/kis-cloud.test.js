const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const KisCloud = require('../lib/kis-cloud-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new KisCloud.KisCloudStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});