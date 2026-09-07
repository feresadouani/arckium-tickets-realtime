import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/is-strong-password.decorator';

export class SetupAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstname!: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastname!: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password!: string;
}
