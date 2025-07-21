// functions/fetchMedia/index.ts
Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { url } = await req.json();

  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return new Response(JSON.stringify({
      success: false,
      error: "The string did not match the expected pattern.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    const response = await fetch("https://saveig.app/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `q=${encodeURIComponent(url)}`,
    });

    const result = await response.json();

    if (!result.status || !result.data || !result.data.medias?.length) {
      return new Response(JSON.stringify({
        success: false,
        error: "No media found or invalid Instagram URL.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const mediaList = result.data.medias.map((media: any) => ({
      quality: media.quality || "default",
      url: media.url,
      size: media.formattedSize || "unknown",
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        type: result.data.type || "post",
        url,
        thumbnail: result.data.thumbnail,
        downloadOptions: mediaList,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
