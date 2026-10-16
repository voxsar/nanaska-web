import {
	IsArray,
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	IsUrl,
	MinLength,
} from 'class-validator';

export class CreateEdgeWebhookDto {
	@IsString()
	@MinLength(1)
	name: string;

	/** Full endpoint on the edge, e.g. https://edge.api.lambda.nanaska.com/api/provision/students/website-registration */
	@IsUrl({ require_tld: false, protocols: ['http', 'https'] })
	url: string;

	/** Shared HMAC secret – the edge's PROVISION_HMAC_SECRET. */
	@IsString()
	@MinLength(8)
	secret: string;

	/** Course / case-study codes this edge serves. Empty means every course. */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	courseCodes?: string[];

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsInt()
	sortOrder?: number;

	@IsOptional()
	@IsString()
	notes?: string;
}
