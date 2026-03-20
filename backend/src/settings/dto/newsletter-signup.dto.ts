import { IsEmail, IsOptional, IsString } from 'class-validator';

export class NewsletterSignupDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}
