import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    try {
      const genre = await this.genresService.findOneByName(createGenreDto.name);
      if (genre) {
        throw new BadRequestException('Genre already exists');
      }

      const newGenre = await this.genresService.create(createGenreDto);
      return {
        statusCode: 201,
        message: 'Genre created successfully',
        data: newGenre,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  @Get()
  async findAll() {
    try {
      const authors = await this.genresService.findAll();
      return {
        statusCode: 200,
        message: 'Genres retrieved successfully',
        data: authors,
      };
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const book = await this.genresService.findOne(id);
      return {
        statusCode: 200,
        message: 'Genre retrieved successfully',
        data: book,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    try {
      const genre = await this.genresService.update(id, updateGenreDto);

      if (!genre) {
        throw new NotFoundException('Genre not found');
      }

      return {
        statusCode: 200,
        message: 'Genre updated successfully',
        data: genre,
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
      const genre = await this.genresService.remove(id);

      if (!genre) {
        throw new NotFoundException('Genre not found');
      }

      return {
        statusCode: 200,
        message: 'Genre deleted successfully',
        data: genre,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
