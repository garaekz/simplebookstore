import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GenreDocument = Genre & Document;

@Schema()
export class Genre {
  @Prop()
  name: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
