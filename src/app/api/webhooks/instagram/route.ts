import { NextRequest, NextResponse } from "next/server";

// GET - Webhook verification (Meta sends this to verify your endpoint)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Instagram webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  console.error("Instagram webhook verification failed");
  return new NextResponse("Forbidden", { status: 403 });
}

// POST - Receive webhook events from Instagram
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Instagram webhook received:", JSON.stringify(body, null, 2));

    // Handle different event types
    if (body.object === "instagram") {
      for (const entry of body.entry) {
        // Handle messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message) {
              // Handle incoming message
              console.log("New message from:", event.sender.id);
              console.log("Message:", event.message.text);
              // TODO: Process message, store in DB, etc.
            }
          }
        }

        // Handle other event types (comments, mentions, etc.)
        if (entry.changes) {
          for (const change of entry.changes) {
            console.log("Change event:", change.field, change.value);
            // TODO: Handle different change types
          }
        }
      }
    }

    // Must return 200 quickly to acknowledge receipt
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("Instagram webhook error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
