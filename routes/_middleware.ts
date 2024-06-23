import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "jsr:@std/http/cookie";
import { supabase, User, userBySession } from "./lib.ts";
import { Effect } from "npm:effect";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal, signal, useSignal } from "@preact/signals";

export interface State {
    data: string;
    user: User;
    supaCreds: [
        supabase_url: string,
        anon_key: string,
    ];
    signal: Signal;
}

export async function handler(_req, ctx) {
    const supabase_url = Deno.env.get("SUPABASE_URL") as string;
    const anon_key = Deno.env.get("ANON_KEY") as string;
    ctx.state.supaCreds = [supabase_url, anon_key];
    let empty: SupabaseClient;
    const s = signal<SupabaseClient>(empty);
    ctx.state.signal = s;
    ctx.state.client = createClient(supabase_url, anon_key);
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
