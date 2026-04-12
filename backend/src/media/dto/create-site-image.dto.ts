import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSiteImageDto {
	@IsString()
	@IsNotEmpty()
	key: string;

	@IsString()
	@IsNotEmpty()
	group: string;

	@IsString()
	@IsNotEmpty()
	label: string;

	@IsString()
	@IsNotEmpty()
	url: string;

	@IsOptional()
	@IsString()
	altText?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	widthHint?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	heightHint?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	sortOrder?: number;
}
