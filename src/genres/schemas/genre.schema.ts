import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type GenreDocument = Genre & Document;

@Schema()
export class Genre {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop()
  slug: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
