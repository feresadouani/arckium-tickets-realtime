import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../users.entity';
import { IsStrongPassword } from 'src/common/validators/is-strong-password.decorator';

export class CreateUserDto {
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

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, {
    message: 'Invalid role (admin, manager, or technician)',
  })
  role!: UserRole;
}
