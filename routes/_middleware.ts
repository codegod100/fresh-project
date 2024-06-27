import { FreshContext } from "$fresh/server.ts";
import { getCookies, setCookie } from "jsr:@std/http/cookie";
import { supabase, User, userBySession } from "./lib.ts";
import { Effect } from "npm:effect";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { createServerClient } from "npm:@supabase/ssr";

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

interface Cookie {
    name: string;
    value: string;
}

export async function handler(req, ctx: FreshContext) {
    const url = new URL(req.url);
    if (url.pathname === "/login") {
        // console.log({ url });
    }
    const supabase_url = Deno.env.get("SUPABASE_URL") as string;
    const anon_key = Deno.env.get("ANON_KEY") as string;
    const cookies = getCookies(req.headers);
    // console.log({ cookies });
    const allCookies: Cookie[] = [];
    for (const cookie in cookies) {
        allCookies.push({ name: cookie, value: cookies[cookie] });
    }
    function getAllCookies(): Promise<Cookie[]> {
        return new Promise((resolve) => {
            resolve(allCookies);
        });
    }
    // console.log({ allCookies });
    ctx.state.supaCreds = [supabase_url, anon_key];
    let empty: SupabaseClient;
    const s = signal<SupabaseClient>(empty);
    ctx.state.signal = s;
    ctx.state.client = createClient(supabase_url, anon_key);
    const resp = await ctx.next();
    if (url.pathname === "/login") {
        // console.log(ctx.state);
    }
    // const user = await ctx.state.ssrclient.auth.getUser();
    // console.log({ user });
    // return next;
    return resp;
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
