import { BadRequestException } from '@nestjs/common/exceptions';
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
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  @Get()
  async findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}
