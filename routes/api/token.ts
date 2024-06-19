import { Cookie, setCookie } from "jsr:@std/http/cookie";
import { Effect } from "npm:effect";
export const handler = async (req: Request, ctx) => {
    const data = await req.json();
    console.log({ data });
    const resp = new Response();
    const cookie: Cookie = { name: "session_id", value: session.id };
    setCookie(resp.headers, cookie);

    return Response.json({ hello: "world" });
};
