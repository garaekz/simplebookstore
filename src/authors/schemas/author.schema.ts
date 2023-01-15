import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AuthorDocument = Author & Document;

@Schema()
export class Author {
  @Prop()
  name: string;

  @Prop()
  slug: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
