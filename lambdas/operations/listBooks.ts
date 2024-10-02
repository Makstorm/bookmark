import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();

export const listBooks = async () => {
    try {
        const data = await docClient.scan({ TableName: process.env.BOOKS_TABLE as string }).promise()
        return data.Items
    } catch (error) {
        console.log('dynamodb err: ', error);
        return null;
    }
}
