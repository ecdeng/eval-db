import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create Categories
  const search = await prisma.category.upsert({
    where: { name: "Search" },
    update: {},
    create: { name: "Search" },
  })

  const productivity = await prisma.category.upsert({
    where: { name: "Productivity" },
    update: {},
    create: { name: "Productivity" },
  })

  const social = await prisma.category.upsert({
    where: { name: "Social" },
    update: {},
    create: { name: "Social" },
  })

  const finance = await prisma.category.upsert({
    where: { name: "Finance" },
    update: {},
    create: { name: "Finance" },
  })

  const ecommerce = await prisma.category.upsert({
    where: { name: "E-commerce" },
    update: {},
    create: { name: "E-commerce" },
  })

  const news = await prisma.category.upsert({
    where: { name: "News" },
    update: {},
    create: { name: "News" },
  })

  // Create SubCategories for E-commerce
  await prisma.subCategory.upsert({
    where: {
      name_categoryId: {
        name: "Checkout",
        categoryId: ecommerce.id,
      },
    },
    update: {},
    create: {
      name: "Checkout",
      categoryId: ecommerce.id,
    },
  })

  await prisma.subCategory.upsert({
    where: {
      name_categoryId: {
        name: "Cart Management",
        categoryId: ecommerce.id,
      },
    },
    update: {},
    create: {
      name: "Cart Management",
      categoryId: ecommerce.id,
    },
  })

  await prisma.subCategory.upsert({
    where: {
      name_categoryId: {
        name: "Product Search",
        categoryId: ecommerce.id,
      },
    },
    update: {},
    create: {
      name: "Product Search",
      categoryId: ecommerce.id,
    },
  })

  // Create SubCategories for Productivity
  await prisma.subCategory.upsert({
    where: {
      name_categoryId: {
        name: "Email",
        categoryId: productivity.id,
      },
    },
    update: {},
    create: {
      name: "Email",
      categoryId: productivity.id,
    },
  })

  await prisma.subCategory.upsert({
    where: {
      name_categoryId: {
        name: "Calendar",
        categoryId: productivity.id,
      },
    },
    update: {},
    create: {
      name: "Calendar",
      categoryId: productivity.id,
    },
  })

  await prisma.subCategory.upsert({
    where: {
      name_categoryId: {
        name: "Document Editing",
        categoryId: productivity.id,
      },
    },
    update: {},
    create: {
      name: "Document Editing",
      categoryId: productivity.id,
    },
  })

  // Create default tool tags
  const defaultToolTags = [
    "Navigation",
    "Text Entry",
    "Element Interaction",
    "File Upload",
    "Captcha Solving",
    "Authentication",
    "Search",
    "Click",
  ]

  for (const tagName of defaultToolTags) {
    await prisma.toolTag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
  }

  // Create default test sets (optional - can be empty)
  // Users can create their own test sets via the UI

  console.log("Seed completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

