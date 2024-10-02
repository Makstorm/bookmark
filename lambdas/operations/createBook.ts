import { DynamoDB } from 'aws-sdk';
import { Book } from '../types/Book';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const docClient = new DynamoDB.DocumentClient();

export const createBook = async (book: Book) => {
    try {
        const id = book.id ? book.id : uuidv4()

        const command = {Item: {...book, id }, TableName: process.env.BOOKS_TABLE as string}

        await docClient.put(command).promise();
        
        const newBook = await docClient.get({ Key: { id }, TableName: process.env.BOOKS_TABLE as string }).promise()
        return newBook.Item;
    } catch (error) {
        console.log('dynamodb err: ', error);
        return null;
    }
}
