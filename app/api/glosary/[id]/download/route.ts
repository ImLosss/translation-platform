import { cookies } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const token = (await cookies()).get("auth_token")?.value;

    const response = await fetch(
        `${process.env.API_URL}/glosary/downloadglosary/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        return new Response(await response.text(), {
            status: response.status,
        });
    }

    return new Response(response.body, {
        status: response.status,
        headers: response.headers,
    });
}