import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("position")
    .select(
      `
      *,
      position_allowance(allowance(id, name))
    `,
    )
    .order("title", { ascending: true })

  if (error) {
    console.error("Supabase error fetching positions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: positionData, error: positionError } = await supabase
    .from("position")
    .insert({
      title: body.title,
      description: body.description,
    })
    .select()
    .single()

  if (positionError) {
    return NextResponse.json({ error: positionError.message }, { status: 500 })
  }

  if (body.allowance_id) {
    const { error: positionAllowanceError } = await supabase.from("position_allowance").insert({
      position_id: positionData.id,
      allowance_id: body.allowance_id,
    })
    if (positionAllowanceError) {
      return NextResponse.json({ error: positionAllowanceError.message }, { status: 500 })
    }
  }

  return NextResponse.json(positionData)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: positionData, error: positionError } = await supabase
    .from("position")
    .update({
      title: body.title,
      description: body.description,
    })
    .eq("id", body.id)
    .select()
    .single()

  if (positionError) {
    return NextResponse.json({ error: positionError.message }, { status: 500 })
  }

  // Handle allowances for existing position
  if (body.allowance_id) {
    const { data: existingAllowance, error: fetchAllowanceError } = await supabase
      .from("position_allowance")
      .select("id")
      .eq("position_id", body.id)
      .single()

    if (fetchAllowanceError && fetchAllowanceError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchAllowanceError.message }, { status: 500 })
    }

    if (existingAllowance) {
      const { error: updateAllowanceError } = await supabase.from("position_allowance").update({
        allowance_id: body.allowance_id,
      }).eq("position_id", body.id)

      if (updateAllowanceError) {
        return NextResponse.json({ error: updateAllowanceError.message }, { status: 500 })
      }
    } else {
      const { error: insertAllowanceError } = await supabase.from("position_allowance").insert({
        position_id: body.id,
        allowance_id: body.allowance_id,
      })
      if (insertAllowanceError) {
        return NextResponse.json({ error: insertAllowanceError.message }, { status: 500 })
      }
    }
  } else {
    // If no allowance_id is provided, delete any existing position_allowance for this position
    const { error: deleteAllowanceError } = await supabase.from("position_allowance").delete().eq("position_id", body.id)
    if (deleteAllowanceError && deleteAllowanceError.code !== "PGRST116") {
      return NextResponse.json({ error: deleteAllowanceError.message }, { status: 500 })
    }
  }

  return NextResponse.json(positionData)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  const { error } = await supabase.from("position").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
