import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePaymentLinkDto {
  /** Admin-facing label (never shown to student) */
  @IsString()
  @MinLength(1)
  label: string;

  @IsString()
  @MinLength(1)
  studentName: string;

  @IsEmail()
  studentEmail: string;

  /** Amount in whole currency units (e.g. 16000 LKR or 105 GBP) */
  @IsInt()
  @Min(1)
  amount: number;

  @IsIn(['LKR', 'GBP'])
  currency: string;

  /** Shown to the student on the payment page */
  @IsOptional()
  @IsString()
  description?: string;

  /** Optional plaintext password – will be bcrypt-hashed before storage */
  @IsOptional()
  @IsString()
  password?: string;

  /** Hard expiry datetime (ISO string) */
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  /** Deactivate the link after it has been paid */
  @IsOptional()
  @IsBoolean()
  expireOnPayment?: boolean;

  /** Send the payment link email to the student immediately */
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
