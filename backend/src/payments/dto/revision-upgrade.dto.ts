import { Transform } from 'class-transformer';
import { Allow, IsString, IsEmail, IsOptional, IsIn, ValidateIf } from 'class-validator';

export class RevisionUpgradeDto {
	/** External user ID (from the calling system, e.g. n8n / CRM) */
	@Transform(({ value }) => value == null ? value : String(value))
	@IsString()
	id: string;

	/** Full name of the student */
	@IsString()
	name: string;

	/** Student email address */
	@IsEmail()
	email: string;

	/** CIMA student ID */
	@IsString()
	student_id: string;

	/** Contact phone number */
	@IsOptional()
	@IsString()
	phone?: string;

	/** Current CIMA type. Also accepted as the target for legacy callers. */
	@ValidateIf((dto) => !dto.target_cima_type)
	@IsIn(['OCS', 'MCS', 'SCS'])
	cima_type?: string;

	/** CIMA case-study type to enroll the student into. */
	@IsOptional()
	@IsIn(['OCS', 'MCS', 'SCS'])
	target_cima_type?: 'OCS' | 'MCS' | 'SCS';

	// The calling system sends the complete user record. These fields are accepted
	// for compatibility but are not used when generating the checkout URL.
	@Allow() timezone?: unknown;
	@Allow() google_calendar_connected?: unknown;
	@Allow() has_accepted_consent?: unknown;
	@Allow() consent_accepted_at?: unknown;
	@Allow() is_approved?: unknown;
	@Allow() approved_at?: unknown;
	@Allow() email_verified_at?: unknown;
	@Allow() is_disabled?: unknown;
	@Allow() active_full_edge?: unknown;
	@Allow() created_at?: unknown;
}
