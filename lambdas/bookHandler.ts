import { APIGatewayProxyHandler, AppSyncResolverEvent } from 'aws-lambda';
import { Book } from './types/Book';
import { createBook } from './operations/createBook';
import { listBooks } from './operations/listBooks';

type AppSyncEvent = {
  
    bookId: string;
    book: Book;
  
};

export const handler = async (event: AppSyncResolverEvent<AppSyncEvent>) => {
  console.log(event)
  switch (event.info.fieldName) {
    case 'createBook':
      return await createBook(event.arguments.book);

    case 'listBooks':
      return await listBooks();

    default:
      return null;
  }
};
