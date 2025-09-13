import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class GlobalSanitizePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) return value;

    const object = plainToInstance(metatype, value);

    // Applique la sanitisation globale
    sanitize(object);

    const errors = await validate(object);
    if (errors.length > 0) throw new BadRequestException(errors);

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
