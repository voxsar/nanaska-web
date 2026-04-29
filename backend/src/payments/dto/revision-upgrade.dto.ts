import { IsString, IsEmail, IsOptional, IsIn } from 'class-validator';

export class RevisionUpgradeDto {
	/** External user ID (from the calling system, e.g. n8n / CRM) */
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

	/** CIMA case-study type to enroll the student into */
	@IsIn(['OCS', 'MCS', 'SCS'])
	cima_type: 'OCS' | 'MCS' | 'SCS';
}
