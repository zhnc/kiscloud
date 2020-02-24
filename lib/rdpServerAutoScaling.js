const cdk = require('@aws-cdk/core');
const autoscaling = require('@aws-cdk/aws-autoscaling');
const ec2 = require('@aws-cdk/aws-ec2');
const iam = require('@aws-cdk/aws-iam');
const cloudwatch = require('@aws-cdk/aws-cloudwatch');
const actions = require('@aws-cdk/aws-cloudwatch-actions')


class RdpServerAutoScaling {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {

        this.asg = new autoscaling.AutoScalingGroup(scope, id + '_ASG', {
            vpc: scope.vpc,
            instanceType: new ec2.InstanceType(props.instanceType),
            machineImage: new ec2.LookupMachineImage({ name: props.iamName }),
            keyName: scope.keyName,
            role: iam.Role.fromRoleArn(scope, id + '_ec2-log-role', props.role),
            vpcSubnets: { subnets: scope.privateSubnets },
            maxCapacity: 3,
            desiredCapacity: 1,
            updateType: autoscaling.UpdateType.ROLLING_UPDATE,
        })
        this.asg.addSecurityGroup(scope.rdpSecurityGroup);

        if (props.alarm) {
            const outAlarm = new cloudwatch.Alarm(scope, id + '_OutAlarm', {
                alarmName: id + '_OutAlarm',
                metric: new cloudwatch.Metric({
                    metricName: 'OnLineCount',
                    namespace: 'UserCount',
                    dimensions: { produceId: props.produceId },
                    period: cdk.Duration.minutes(1),
                    statistic: 'Average',

                }),
                evaluationPeriods: 1,
                comparisonOperator: 'GreaterThanOrEqualToThreshold',
                threshold: 70,
            });

            const scalingOutAction = new autoscaling.StepScalingAction(scope, id + '_scalingOutPolicy', {
                autoScalingGroup: this.asg,
                adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY

            });

            scalingOutAction.addAdjustment({ adjustment: 1, lowerBound: 0 })
            outAlarm.addAlarmAction(new actions.AutoScalingAction(scalingOutAction));
        }

    }
}

module.exports = { RdpServerAutoScaling }