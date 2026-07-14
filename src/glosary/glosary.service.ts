import { Injectable } from '@nestjs/common';
import { CreateGlosaryDto } from './dto/create-glosary.dto';
import { UpdateGlosaryDto } from './dto/update-glosary.dto';

@Injectable()
export class GlosaryService {
  create(createGlosaryDto: CreateGlosaryDto) {
    return 'This action adds a new glosary';
  }

  findAll() {
    return `This action returns all glosary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} glosary`;
  }

  update(id: number, updateGlosaryDto: UpdateGlosaryDto) {
    return `This action updates a #${id} glosary`;
  }

  remove(id: number) {
    return `This action removes a #${id} glosary`;
  }
}
