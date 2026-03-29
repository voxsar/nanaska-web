import { PrismaClient } from '@prisma/client';

/**
 * Migration script to remap external image URLs to local paths
 * 
 * This script updates all image URLs in the database from:
 *   https://www.nanaska.com/wp-content/uploads/YYYY/MM/filename.ext
 * To:
 *   /images/YYYY-MM-filename.ext
 * 
 * Affected tables:
 * - lecturers (image_url)
 * - testimonials (image_url)
 * - blog_posts (cover_url)
 * - page_meta (og_image)
 * 
 * Usage:
 *   cd backend
 *   npx ts-node scripts/migrate-image-urls.ts
 */

const prisma = new PrismaClient();

// Helper function to convert external URL to local path
function remapImageUrl(url: string | null): string | null {
	if (!url) return null;

	// Match WordPress upload URL pattern
	const pattern = /https:\/\/(?:www\.nanaska\.com|images\.nanaska\.com)\/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)$/;
	const match = url.match(pattern);

	if (match) {
		const [, year, month, filename] = match;
		return `/images/${year}-${month}-${filename}`;
	}

	// If already local path or doesn't match, return as-is
	return url;
}

async function main() {
	console.log('==========================================');
	console.log('Image URL Migration Script');
	console.log('==========================================\n');

	let totalUpdated = 0;

	// 1. Update Lecturers
	console.log('1. Updating lecturers...');
	const lecturers = await prisma.lecturer.findMany({
		where: {
			imageUrl: {
				contains: 'nanaska.com/wp-content/uploads'
			}
		}
	});

	for (const lecturer of lecturers) {
		const newUrl = remapImageUrl(lecturer.imageUrl);
		if (newUrl !== lecturer.imageUrl) {
			await prisma.lecturer.update({
				where: { id: lecturer.id },
				data: { imageUrl: newUrl }
			});
			console.log(`   ✓ ${lecturer.name}: ${newUrl}`);
			totalUpdated++;
		}
	}
	console.log(`   Updated ${lecturers.length} lecturer(s)\n`);

	// 2. Update Testimonials
	console.log('2. Updating testimonials...');
	const testimonials = await prisma.testimonial.findMany({
		where: {
			imageUrl: {
				contains: 'nanaska.com/wp-content/uploads'
			}
		}
	});

	for (const testimonial of testimonials) {
		const newUrl = remapImageUrl(testimonial.imageUrl);
		if (newUrl !== testimonial.imageUrl) {
			await prisma.testimonial.update({
				where: { id: testimonial.id },
				data: { imageUrl: newUrl }
			});
			console.log(`   ✓ ${testimonial.studentName}: ${newUrl}`);
			totalUpdated++;
		}
	}
	console.log(`   Updated ${testimonials.length} testimonial(s)\n`);

	// 3. Update Blog Posts
	console.log('3. Updating blog posts...');
	const blogPosts = await prisma.blogPost.findMany({
		where: {
			coverUrl: {
				contains: 'nanaska.com/wp-content/uploads'
			}
		}
	});

	for (const post of blogPosts) {
		const newUrl = remapImageUrl(post.coverUrl);
		if (newUrl !== post.coverUrl) {
			await prisma.blogPost.update({
				where: { id: post.id },
				data: { coverUrl: newUrl }
			});
			console.log(`   ✓ ${post.title}: ${newUrl}`);
			totalUpdated++;
		}
	}
	console.log(`   Updated ${blogPosts.length} blog post(s)\n`);

	// 4. Update Page Meta
	console.log('4. Updating page meta...');
	const pageMeta = await prisma.pageMeta.findMany({
		where: {
			ogImage: {
				contains: 'nanaska.com/wp-content/uploads'
			}
		}
	});

	for (const meta of pageMeta) {
		const newUrl = remapImageUrl(meta.ogImage);
		if (newUrl !== meta.ogImage) {
			await prisma.pageMeta.update({
				where: { id: meta.id },
				data: { ogImage: newUrl }
			});
			console.log(`   ✓ ${meta.pagePath}: ${newUrl}`);
			totalUpdated++;
		}
	}
	console.log(`   Updated ${pageMeta.length} page meta record(s)\n`);

	console.log('==========================================');
	console.log(`✓ Migration complete!`);
	console.log(`  Total records updated: ${totalUpdated}`);
	console.log('==========================================');
}

main()
	.catch((error) => {
		console.error('Migration failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
