import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if there are any combinations with courses from different levels
  const allCombos = await prisma.courseCombination.findMany({
    include: {
      items: {
        include: {
          course: { select: { id: true, level: true } }
      }
      }
    }
  });

  console.log(`Total combinations: ${allCombos.length}\n`);

  // Check for cross-level combinations
  const crossLevel = allCombos.filter(combo => {
    const levels = new Set(combo.items.map(i => i.course.level));
    return levels.size > 1;
  });

  console.log(`Cross-level combinations: ${crossLevel.length}`);
  if (crossLevel.length > 0) {
    crossLevel.forEach(c => {
      const courses = c.items.map(i => `${i.course.id} (${i.course.level})`).join(', ');
      console.log(`  ${c.id}: ${courses}`);
    });
  }

  // Test: Can we buy E1 (operational) + E2 (management)?
  const e1e2 = allCombos.find(combo => {
    const courses = combo.items.map(i => i.course.id).sort();
    return courses.length === 2 && courses.includes('E1') && courses.includes('E2');
  });

  console.log(`\nCan buy E1 + E2 together?`, e1e2 ? `Yes: ${e1e2.id}` : 'No - combination does not exist');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
