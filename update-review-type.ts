import prisma from './lib/prisma';

async function main() {
  const mapping: Record<string, string> = {
    'App\\Models\\Product': 'Product',
    'App\\Models\\Shop': 'Shop',
    'App\\Models\\TouristAttraction': 'TouristAttraction',
    'App\\Models\\LocalSpecialty': 'LocalSpecialty',
    'App\\Models\\CulturalArt': 'CulturalArt'
  };

  for (const [oldType, newType] of Object.entries(mapping)) {
    const res = await prisma.review.updateMany({
      where: { reviewable_type: oldType },
      data: { reviewable_type: newType }
    });
    console.log(`Updated ${res.count} records from ${oldType} to ${newType}`);
  }
}

main()
  .then(async () => {
    // await prisma.$disconnect() // already managed by next.js wrapper
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
