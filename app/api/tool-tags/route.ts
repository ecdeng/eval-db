import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Tool tags are stored both in the tool_tags table and as arrays in tests
export async function GET() {
  try {
    const allTags = new Set<string>()

    // Try to get stored tags from database (may fail if table doesn't exist yet)
    try {
      const storedTags = await prisma.toolTag.findMany({
        select: {
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      })
      storedTags.forEach((tag) => allTags.add(tag.name))
    } catch (error: any) {
      // If ToolTag table doesn't exist or query fails, continue without it
      console.warn("Could not fetch tool tags from database table:", error.message)
    }

    // Also extract tags from tests (in case some exist in tests but not in the table)
    try {
      const tests = await prisma.test.findMany({
        select: {
          toolTags: true,
        },
      })
      tests.forEach((test) => {
        test.toolTags.forEach((tag) => allTags.add(tag))
      })
    } catch (error: any) {
      console.warn("Could not fetch tool tags from tests:", error.message)
    }

    // Default tool tags from PRD (always include these)
    const defaultTags = [
      "Navigation",
      "Text Entry",
      "Element Interaction",
      "File Upload",
      "Captcha Solving",
      "Authentication",
      "Search",
      "Click",
    ]

    defaultTags.forEach((tag) => allTags.add(tag))

    const sortedTags = Array.from(allTags).sort()

    return NextResponse.json(sortedTags)
  } catch (error: any) {
    console.error("Error fetching tool tags:", error)
    // Return at least the default tags even if everything fails
    const defaultTags = [
      "Navigation",
      "Text Entry",
      "Element Interaction",
      "File Upload",
      "Captcha Solving",
      "Authentication",
      "Search",
      "Click",
    ]
    return NextResponse.json(defaultTags.sort())
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Tool tag name is required" },
        { status: 400 }
      )
    }

    const tagName = name.trim()

    // Create or get the tool tag
    const toolTag = await prisma.toolTag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })

    return NextResponse.json(toolTag, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Tool tag with this name already exists" },
        { status: 409 }
      )
    }
    console.error("Error creating tool tag:", error)
    return NextResponse.json(
      { error: "Failed to create tool tag" },
      { status: 500 }
    )
  }
}
