import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString({ each: true })
  @IsNotEmpty()
  authors: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  genres: string[];

  @IsString()
  @IsNotEmpty()
  published: Date;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  cover: string;

  @IsOptional()
  @IsNumber()
  discount?: number;
}
