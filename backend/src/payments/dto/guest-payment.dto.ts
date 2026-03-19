import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GuestPaymentDto {
  /** The course combination ID the guest wants to pay for */
  @IsString()
  combinationId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
