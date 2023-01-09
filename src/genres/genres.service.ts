import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist';
import { Model } from 'mongoose';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre, GenreDocument } from './schemas/genre.schema';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name)
    private readonly genreModel: Model<GenreDocument>,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<GenreDocument> {
    return await this.genreModel.create(createGenreDto);
  }

  async findAll(): Promise<GenreDocument[]> {
    return await this.genreModel.find().exec();
  }

  async findOneByName(name: string): Promise<GenreDocument> {
    return await this.genreModel.findOne({ name }).exec();
  }

  async findByIds(ids: string[]): Promise<GenreDocument[]> {
    return await this.genreModel.find({ _id: { $in: ids } }).exec();
  }

  async findOne(id: string): Promise<GenreDocument> {
    return await this.genreModel.findById(id).exec();
  }

  async update(
    id: string,
    updateGenreDto: UpdateGenreDto,
  ): Promise<GenreDocument> {
    return await this.genreModel.findByIdAndUpdate(id, updateGenreDto);
  }

  async remove(id: string): Promise<GenreDocument> {
    return await this.genreModel.findByIdAndDelete(id);
  }
}
