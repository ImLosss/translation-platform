import { drive } from "@/app/lib/googleDrive";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const range = req.headers.get("range");

  const meta = await drive.files.get({
    fileId: id,
    fields: "size,mimeType,name",
  });

  const size = Number(meta.data.size);
  const mime = meta.data.mimeType || "video/mp4";

  let start = 0;
  let end = size - 1;

  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);

    if (match) {
      start = Number(match[1]);

      if (match[2]) end = Number(match[2]);
    }
  }

  const response = await drive.files.get(
    {
      fileId: id,
      alt: "media",
    },
    {
      responseType: "stream",
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    }
  );

  return new Response(response.data as any, {
    status: 206,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
    },
  });
}