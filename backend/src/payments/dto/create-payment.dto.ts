import { IsString, IsOptional, IsIn, IsArray } from 'class-validator';

export class CreatePaymentDto {
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

	/** Payment currency – GBP for international, LKR for Sri Lanka */
	@IsOptional()
	@IsIn(['GBP', 'LKR'])
	currency?: string;
}
