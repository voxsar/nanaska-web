import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateFlpLeadDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	fullName: string;

	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	phone?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	whatsapp?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	qualification?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	entryLevel?: string;

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	message?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	source?: string;
}
