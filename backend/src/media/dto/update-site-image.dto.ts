import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSiteImageDto {
	@IsOptional()
	@IsString()
	url?: string;

	@IsOptional()
	@IsString()
	altText?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	sortOrder?: number;
}
