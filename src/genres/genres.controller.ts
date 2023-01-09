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
import { BadRequestException } from '@nestjs/common/exceptions';

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
    return this.genresService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }
}
