#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from "../resources/infrastructure-stack";

const app = new cdk.App();
new InfrastructureStack(
    app,
    'staging-infrastructure-stack',
    {
        owner: 'AdamJHall',
        repo: 'CdkDemoApp',
        branch: 'staging'
    }
);
new InfrastructureStack(
    app,
    'production-infrastructure-stack',
    {
        owner: 'AdamJHall',
        repo: 'CdkDemoApp',
        branch: 'production',
        manualApprovals: true
    }
);
app.synth();