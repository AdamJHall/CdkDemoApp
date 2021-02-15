#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from "../resources/infrastructure-stack";

const app = new cdk.App();
new InfrastructureStack(
    app,
    'staging-infrastructure-stack',
    {
        branch: 'staging'
    }
);
new InfrastructureStack(
    app,
    'production-infrastructure-stack',
    {
        branch: 'production',
        manualApprovals: true
    }
);
app.synth();