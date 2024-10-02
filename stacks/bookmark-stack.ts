// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam, CfnOutput, Duration, Expiration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationType, Definition, FieldLogLevel, GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { join } from 'path';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BookmarkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // AsyncApp Gateway
    const api = new GraphqlApi(this, "books-appsync-api", {
      name: 'books-appsync-api',
      definition: Definition.fromFile(join(__dirname, '..', 'graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    })
    
    // Defining Lambda functions
    const booksLambda = new NodejsFunction(this, 'books-lambda', {
      functionName: "books-lambda",
      entry: join(__dirname, '..', "lambdas/bookHandler.ts"),
      handler: 'handler',
    })

    // Marking lambda as data source
    const lambdaDataSource = api.addLambdaDataSource('lambda-data-source', booksLambda);

    //Creating resolvers
    lambdaDataSource.createResolver('query-resolver',{
      typeName: 'Query',
      fieldName: 'listBooks',
    });

    lambdaDataSource.createResolver("mutation-resolver",{
      typeName: 'Mutation',
      fieldName: 'createBook',
    })

    //Creating dynamodb table
    const booksTable = new Table(this, `books-api-table`, {
      tableName: 'books-api-table',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Granting access
    booksTable.grantFullAccess(booksLambda)

    booksLambda.addEnvironment('BOOKS_TABLE', booksTable.tableName);

    new CfnOutput(this, 'GraphQlApiURL', { value: api.graphqlUrl });
    new CfnOutput(this, "GraphQLApiKey", {
      value: api.apiKey || ''
    });
    // new CfnOutput(this, 'CognitoUserPoolId', { value: userPool.userPoolId });
    // new CfnOutput(this, 'CognitoAppClientId', { value: userPoolClient.userPoolClientId });
    // new CfnOutput(this, 'SQSQueueUrl', { value: queue.queueUrl });


    // const queue = new Queue(this, 'AsyncQueue', {
    //   visibilityTimeout: Duration.seconds(30),
    //   retentionPeriod: Duration.days(1),
    // });

    // const sqsLambda = new NodejsFunction(this, 'SqsLambda', {
    //   entry: join(__dirname, 'lambdas/sqsHandler.ts'),
    //   handler: 'handler',
    //   initialPolicy: [
    //     new aws_iam.PolicyStatement({
    //       effect: aws_iam.Effect.ALLOW,
    //       actions: ['sns:*'],
    //       resources: [queue.queueArn]
    //     }),
    //   ]
    // });

    
    // queue.grantConsumeMessages(sqsLambda)
    // queue.grantSendMessages(graphqlLambda)

    // sqsLambda.addEventSource(new SqsEventSource(queue))

    // COGNITO POOL

    // const userPool = new UserPool(this, "UserPool", {
    //   signInAliases: { phone: true },
    //   autoVerify: { phone: true },
    //   userInvitation: {
    //     smsMessage: 'Your verification code is {####}'
    //   }
    // })

    // const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
    //   userPool,
    //   authFlows: {
    //     userSrp: true,
    //     custom: true
    //   }
    // })
  }
}
