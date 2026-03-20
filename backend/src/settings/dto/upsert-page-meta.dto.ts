import { IsString, IsOptional } from 'class-validator';

export class UpsertPageMetaDto {
  @IsString()
  pagePath: string;

  @IsString()
  pageTitle: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDesc?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDesc?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;
}
