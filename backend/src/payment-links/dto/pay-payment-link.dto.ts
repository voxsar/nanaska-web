import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/** Payload from the student when initiating a payment via a payment link */
export class PayPaymentLinkDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
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

  /** Required when the link is password-protected */
  @IsOptional()
  @IsString()
  password?: string;
}
