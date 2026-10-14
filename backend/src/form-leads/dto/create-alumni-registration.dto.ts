import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAlumniRegistrationDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	name: string;

	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	phone: string;

	@IsOptional()
	@IsString()
	@MaxLength(150)
	occupation?: string;

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	address?: string;
}
