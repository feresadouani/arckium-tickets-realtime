import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/is-strong-password.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstname!: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastname!: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password!: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEmpty({
    message:
      'Role cannot be set via /auth/register. Use POST /users/add (as administrator).',
  })
  role?: string;
}
