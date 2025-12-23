import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const setName = decodeURIComponent(name)

    // Check if set is used in any tests
    const testsWithSet = await prisma.test.findMany({
      where: {
        testSets: {
          has: setName,
        },
      },
    })

    if (testsWithSet.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete test set that is in use",
          testCount: testsWithSet.length,
          message: `This test set is used by ${testsWithSet.length} test(s). Please remove it from those tests first.`,
        },
        { status: 409 }
      )
    }

    await prisma.testSet.delete({
      where: { name: setName },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Test set not found" }, { status: 404 })
    }
    console.error("Error deleting test set:", error)
    return NextResponse.json(
      { error: "Failed to delete test set" },
      { status: 500 }
    )
  }
}

