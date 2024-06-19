import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "jsr:@std/http/cookie";
import { supabase, User, userBySession } from "./lib.ts";
import { Effect } from "npm:effect";

interface State {
    data: string;
    user: User;
}

export async function handler(_req, ctx) {
    // const resp = await supabase.auth.getUser();
    // const user = resp.data.user;
    // const redirects = ["/posts/create"];
    // console.log({ resp });
    // if (!user && redirects.includes(ctx.route)) {
    //     return new Response("", {
    //         status: 307,
    //         headers: { Location: "/login" },
    //     });
    // }
    return ctx.next();
}
// export async function handler(req: Request, ctx: FreshContext<State>) {
//     const program = Effect.gen(function* () {
//         console.log({ route: ctx.route });
//         const cookies = getCookies(req.headers);
//         const session_id = cookies["session_id"];
//         console.log({ session_id });
//         if (session_id) {
//             const user = yield* userBySession(session_id);
//             ctx.state.user = user;
//         }
//     });
//     await Effect.runPromise(program);
//     const redirects = ["/posts/create"];

//     if (!ctx.state.user && redirects.includes(ctx.route)) {
//         return new Response("", {
//             status: 307,
//             headers: { Location: "/" },
//         });
//     }
//     return ctx.next();
// }
