import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTestimonialDto {
	@IsOptional()
	id?: string;

	@IsOptional()
	createdAt?: any;

	@IsOptional()
	updatedAt?: any;

	@IsString()
	studentName: string;

	@IsString()
	country: string;

	@IsString()
	flag: string;

	@IsString()
	tag: string;

	@IsString()
	exam: string;

	@IsString()
	period: string;

	@Type(() => Number)
	@IsInt()
	year: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	marks?: number;

	@IsOptional()
	@IsString()
	imageUrl?: string;

	@IsString()
	quote: string;

	@IsOptional()
	@IsString()
	videoUrl?: string;

	@IsOptional()
	@IsString()
	badge?: string;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	isPrizeWinner?: boolean;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	published?: boolean;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	sortOrder?: number;
}
