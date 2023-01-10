import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author, AuthorDocument } from './schemas/author.schema';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<AuthorDocument>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<AuthorDocument> {
    return await this.authorModel.create(createAuthorDto);
  }

  async findAll(): Promise<AuthorDocument[]> {
    return await this.authorModel.find().exec();
  }

  async findOne(id: string): Promise<AuthorDocument> {
    return await this.authorModel.findById(id).exec();
  }

  async findOneByName(name: string): Promise<AuthorDocument> {
    return await this.authorModel.findOne({ name }).exec();
  }

  async findByIds(ids: string[]): Promise<AuthorDocument[]> {
    return await this.authorModel.find({ _id: { $in: ids } }).exec();
  }

  async update(
    id: string,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<AuthorDocument> {
    return await this.authorModel.findByIdAndUpdate(id, updateAuthorDto).exec();
  }

  async remove(id: string): Promise<AuthorDocument> {
    return await this.authorModel.findByIdAndDelete(id).exec();
  }
}
