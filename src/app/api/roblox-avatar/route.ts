import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  try {
    const userLookupResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
      cache: "no-store",
    });

    if (!userLookupResponse.ok) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    const userLookup = await userLookupResponse.json();
    const userId = userLookup?.data?.[0]?.id;

    if (!userId) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    const thumbnailResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
      { cache: "no-store" },
    );

    if (!thumbnailResponse.ok) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    const thumbnailData = await thumbnailResponse.json();
    const avatarUrl = thumbnailData?.data?.[0]?.imageUrl ?? null;

    return NextResponse.json({ avatarUrl });
  } catch {
    return NextResponse.json({ avatarUrl: null }, { status: 200 });
  }
}
