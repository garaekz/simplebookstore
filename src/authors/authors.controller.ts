import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(@Body() createAuthorDto: CreateAuthorDto) {
    try {
      const author = await this.authorsService.findOneByName(
        createAuthorDto.name,
      );
      if (author) {
        throw new BadRequestException('Author already exists');
      }

      const newAuthor = await this.authorsService.create(createAuthorDto);
      return {
        statusCode: 201,
        message: 'Author created successfully',
        data: newAuthor,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      const authors = await this.authorsService.findAll();
      return {
        statusCode: 200,
        message: 'Authors retrieved successfully',
        data: authors,
      };
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const book = await this.authorsService.findOneById(id);
      return {
        statusCode: 200,
        message: 'Author retrieved successfully',
        data: book,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    try {
      const author = await this.authorsService.update(id, updateAuthorDto);

      if (!author) {
        throw new NotFoundException('Author not found');
      }

      return {
        statusCode: 200,
        message: 'Author updated successfully',
        data: author,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const author = await this.authorsService.remove(id);

      if (!author) {
        throw new NotFoundException('Author not found');
      }

      return {
        statusCode: 200,
        message: 'Author deleted successfully',
        data: author,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
