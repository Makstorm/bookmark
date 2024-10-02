import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    console.log('Processing SQS message:', record.body);
  }
  return {
    statusCode: 200,
    body: "Success",
  };
};
