import { PartialType } from '@nestjs/mapped-types';
import { CreateGlosaryDto } from './create-glosary.dto';

export class UpdateGlosaryDto extends PartialType(CreateGlosaryDto) {}