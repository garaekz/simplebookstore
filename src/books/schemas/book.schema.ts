import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Author } from 'src/authors/schemas/author.schema';
import { Genre } from 'src/genres/schemas/genre.schema';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  authors: Author[];

  @Prop()
  genres: Genre[];

  @Prop()
  published: Date;

  @Prop()
  rating: number;

  @Prop()
  price: number;

  @Prop()
  cover: string;

  @Prop({ default: 0 })
  discount: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
