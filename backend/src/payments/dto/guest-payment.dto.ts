import { IsString, IsEmail, IsOptional, IsIn, IsArray, IsBoolean, IsObject } from 'class-validator';

export class GuestPaymentDto {
	/** Single course combination ID (for single package checkout) */
	@IsOptional()
	@IsString()
	combinationId?: string;

	/** Multiple combination IDs (for multiple packages in cart) */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	combinationIds?: string[];

	/** Array of course IDs for individual courses in cart */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	courseIds?: string[];

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	phone?: string;

	/** Payment currency – GBP for international, LKR for Sri Lanka */
	@IsOptional()
	@IsIn(['GBP', 'LKR'])
	currency?: string;

	/** Flag that this is a Nanaska Edge revision payment – forces 10 LKR and stores enrollment metadata */
	@IsOptional()
	@IsBoolean()
	isEdgeRevision?: boolean;

	/** Enrollment form data to be stored in order metaJson and used to create the enrollment record after payment success */
	@IsOptional()
	@IsObject()
	enrollmentMeta?: Record<string, unknown>;
}
