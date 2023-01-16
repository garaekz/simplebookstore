import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, SchemaTypes } from 'mongoose';
import { Author } from 'src/authors/schemas/author.schema';
import { Genre } from 'src/genres/schemas/genre.schema';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ index: true })
  title: string;

  @Prop()
  slug: string;

  @Prop()
  saga?: string;

  @Prop()
  sagaNumber?: number;

  @Prop({ index: 'text' })
  description: string;

  @Prop()
  authors: Author[];

  @Prop()
  genres: Genre[];

  @Prop()
  published: Date;

  @Prop()
  rating?: number;

  @Prop()
  price: number;

  @Prop()
  discountedPrice?: number;

  @Prop()
  cover: string;

  @Prop({ default: 0 })
  discount: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
