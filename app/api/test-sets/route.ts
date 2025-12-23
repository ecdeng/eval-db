import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Test sets are stored both in the test_sets table and as arrays in tests
export async function GET() {
  try {
    const allSets = new Set<string>()

    // Try to get stored test sets from database
    try {
      const storedSets = await prisma.testSet.findMany({
        select: {
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      })
      storedSets.forEach((set) => allSets.add(set.name))
    } catch (error: any) {
      console.warn("Could not fetch test sets from database table:", error.message)
    }

    // Also extract sets from tests (in case some exist in tests but not in the table)
    try {
      const tests = await prisma.test.findMany({
        select: {
          testSets: true,
        },
      })
      tests.forEach((test) => {
        test.testSets.forEach((set) => allSets.add(set))
      })
    } catch (error: any) {
      console.warn("Could not fetch test sets from tests:", error.message)
    }

    const sortedSets = Array.from(allSets).sort()

    return NextResponse.json(sortedSets)
  } catch (error: any) {
    console.error("Error fetching test sets:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Test set name is required" },
        { status: 400 }
      )
    }

    const setName = name.trim()

    // Create or get the test set
    const testSet = await prisma.testSet.upsert({
      where: { name: setName },
      update: {},
      create: { name: setName },
    })

    return NextResponse.json(testSet, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Test set with this name already exists" },
        { status: 409 }
      )
    }
    console.error("Error creating test set:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create test set", details: error.stack },
      { status: 500 }
    )
  }
}

