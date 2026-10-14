import { IsString, IsEmail, IsOptional, IsNotEmpty, IsIn, MaxLength } from 'class-validator';

export class CreateEnquiryLeadDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	name: string;

	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	phone?: string;

	@IsOptional()
	@IsIn(['certificate', 'operational', 'management', 'strategic', ''])
	level?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	source?: string;
}
