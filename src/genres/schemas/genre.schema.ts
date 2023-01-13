import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GenreDocument = Genre & Document;

@Schema()
export class Genre {
  @Prop()
  name: string;

  @Prop()
  image: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
