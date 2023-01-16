import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type AuthorDocument = Author & Document;

@Schema()
export class Author {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  slug: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
