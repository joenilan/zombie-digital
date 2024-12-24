import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const canvasId = params.id;

  // Set up SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to Supabase changes
      const channel = supabase
        .channel(`canvas_${canvasId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "canvas_media_objects",
            filter: `canvas_id=eq.${canvasId}`,
          },
          (payload) => {
            // Send the update through SSE
            const data = JSON.stringify({
              type: payload.eventType,
              data: payload.new || payload.old,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        )
        .subscribe();

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n"));
      }, 30000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        supabase.removeChannel(channel);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// No need for POST endpoint since we're using Supabase real-time
