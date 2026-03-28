import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Get all operational level combinations
	const opCombos = await prisma.courseCombination.findMany({
		where: { level: 'operational' },
		include: {
			items: {
				include: {
					course: { select: { id: true, name: true } }
				}
			}
		},
		orderBy: { id: 'asc' }
	});

	console.log(`\nFound ${opCombos.length} operational combinations:\n`);

	for (const combo of opCombos) {
		const courses = combo.items.map(i => i.course.id).join(', ');
		console.log(`${combo.id}: [${courses}] - LKR ${combo.price} / GBP ${combo.priceGbp}`);
	}

	// Check for a specific two-course combo (E1 + F1)
	const e1f1 = await prisma.courseCombination.findFirst({
		where: { id: 'op_e1_f1' },
		include: {
			items: {
				include: {
					course: { select: { id: true, name: true } }
				}
			}
		}
	});

	console.log(`\n\nChecking op_e1_f1 combination:`);
	if (e1f1) {
		console.log('✓ Found:', e1f1.id, '- Price:', e1f1.price, e1f1.priceGbp);
		console.log('  Courses:', e1f1.items.map(i => `${i.course.id} (${i.course.name})`).join(', '));
	} else {
		console.log('✗ Not found');
	}
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
