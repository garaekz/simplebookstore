import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author, AuthorDocument } from './schemas/author.schema';
import { ObjectId } from 'mongodb';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { generateUniqueSlug } from '../utils/generate-unique-slug';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<AuthorDocument>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<AuthorDocument> {
    try {
      createAuthorDto.slug = await generateUniqueSlug(
        this.authorModel,
        createAuthorDto.name,
      );
      return await this.authorModel.create(createAuthorDto);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<AuthorDocument[]> {
    return await this.authorModel.find().exec();
  }

  async findOneById(id: string): Promise<AuthorDocument> {
    if (!id || !ObjectId.isValid(id)) {
      throw new BadRequestException('The provided ID is invalid');
    }
    const author = await this.authorModel.findById(id).exec();

    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
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
