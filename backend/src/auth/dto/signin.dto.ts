import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from 'src/users/users.entity';
export class SignInDto {
    @IsNotEmpty()
    @IsEmail()
    email!:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!:string;

    @IsEnum(UserRole)
    role!:UserRole;

}