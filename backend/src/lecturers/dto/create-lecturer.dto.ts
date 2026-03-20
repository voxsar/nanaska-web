import { IsString, IsOptional, IsBoolean, IsArray, IsInt, IsNumber } from 'class-validator';

export class CreateLecturerDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsArray()
  credentials: string[];

  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  bio2?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  stats?: Array<{ number: string; label: string }>;

  @IsOptional()
  @IsArray()
  specialties?: string[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
