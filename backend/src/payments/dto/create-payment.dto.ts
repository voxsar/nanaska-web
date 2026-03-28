import { IsString, IsOptional, IsIn, IsInt, Min, IsArray } from 'class-validator';

export class CreatePaymentDto {
	/** The course combination ID the user wants to pay for */
	@IsOptional()
	@IsString()
	combinationId?: string;

	/** Array of course IDs to create a dynamic combination (alternative to combinationId) */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	courseIds?: string[];

	/** Payment currency – GBP for international, LKR for Sri Lanka */
	@IsOptional()
	@IsIn(['GBP', 'LKR'])
	currency?: string;

	/** Amount in the selected currency (required when currency is GBP) */
	@IsOptional()
	@IsInt()
	@Min(1)
	amount?: number;
}
