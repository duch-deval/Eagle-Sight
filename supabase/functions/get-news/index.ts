import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { platform } = await req.json();

    if (!platform) {
      return new Response(JSON.stringify({ error: "Missing platform", articles: [] }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key", articles: [] }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Call Perplexity
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `Respond ONLY with a valid JSON array of 7 objects.
            Each must include: "title", "summary", "date", "source", "url", "relevance" (high|medium|low)`,
          },
          {
            role: "user",
            content: `Give me 7 highlights about ${platform} procurement and budget news from the last 7 days.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    let articles: any[] = [];

    // Try to parse the assistant's JSON
    const content = data.choices?.[0]?.message?.content?.trim();
    if (content) {
      try {
        const cleaned = content.replace(/```json|```/g, "").trim();
        articles = JSON.parse(cleaned);
      } catch (err) {
        console.warn("⚠️ Failed to parse content, falling back to search_results");
      }
    }

    // ✅ Fallback: use search_results if parsing failed
    if ((!articles || articles.length === 0) && data.search_results) {
      articles = data.search_results.slice(0, 7).map((r: any, i: number) => ({
        title: r.title,
        summary: r.snippet || "",
        date: r.date || new Date().toISOString().split("T")[0],
        source: new URL(r.url).hostname.replace("www.", ""),
        url: r.url,
        relevance: i < 2 ? "high" : i < 5 ? "medium" : "low",
      }));
    }

    return new Response(JSON.stringify({ articles }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: (err as Error).message, articles: [] }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});
