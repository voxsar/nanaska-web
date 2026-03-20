import { IsString, IsEmail, IsOptional, IsInt, IsArray, Min } from 'class-validator';

export class EnrollmentSubmitDto {
	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsString()
	whatsapp?: string;

	@IsOptional()
	@IsString()
	cimaId?: string;

	@IsOptional()
	@IsString()
	cimaStage?: string;

	@IsOptional()
	@IsString()
	dob?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsString()
	country?: string;

	@IsOptional()
	@IsString()
	city?: string;

	@IsOptional()
	@IsString()
	postcode?: string;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsOptional()
	@IsArray()
	cartItems?: any[];

	@IsOptional()
	@IsString()
	currency?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	amount?: number;
}
