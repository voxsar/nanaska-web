import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBlogPostDto {
	@IsOptional()
	id?: string;

	@IsOptional()
	createdAt?: any;

	@IsOptional()
	updatedAt?: any;

	@IsOptional()
	authorId?: string;

	@IsString()
	title: string;

	@IsString()
	content: string;

	@IsOptional()
	@IsString()
	slug?: string;

	@IsOptional()
	@IsString()
	coverUrl?: string;

	@IsOptional()
	@IsBoolean()
	published?: boolean;

	@IsOptional()
	@IsString()
	metaTitle?: string;

	@IsOptional()
	@IsString()
	metaDesc?: string;
}
