import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const tagName = decodeURIComponent(name)

    // Check if tag is used in any tests
    const testsWithTag = await prisma.test.findMany({
      where: {
        toolTags: {
          has: tagName,
        },
      },
    })

    if (testsWithTag.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tool tag that is in use",
          testCount: testsWithTag.length,
          message: `This tool tag is used by ${testsWithTag.length} test(s). Please remove it from those tests first.`,
        },
        { status: 409 }
      )
    }

    await prisma.toolTag.delete({
      where: { name: tagName },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Tool tag not found" }, { status: 404 })
    }
    console.error("Error deleting tool tag:", error)
    return NextResponse.json(
      { error: "Failed to delete tool tag" },
      { status: 500 }
    )
  }
}

