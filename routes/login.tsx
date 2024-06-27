import { defineRoute, PageProps } from "$fresh/server.ts";
import { getCookies, setCookie } from "jsr:@std/http/cookie";
import Signin from "../islands/Signin.tsx";
import { SupabaseClient } from "npm:@supabase/supabase-js";
import {
    FreshContext,
    HandlerContext,
    RouteContext,
} from "$fresh/src/server/types.ts";
import { createServerClient } from "npm:@supabase/ssr";
import { serverClient } from "./lib.ts";

interface Cookie {
    name: string;
    value: string;
}

const redirect_url = Deno.env.get("REDIRECT_URL") as string;
export const handler = {
    async GET(req, ctx: FreshContext) {
        const { searchParams, origin } = new URL(req.url);
        const code = searchParams.get("code");
        const resp = await ctx.render();
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
                // console.log({ allCookies });
                resolve(allCookies);
            });
        }

        if (code) {
            const serverClient = createServerClient(supabase_url, anon_key, {
                cookies: {
                    getAll: getAllCookies,
                    setAll: (cookies) => {
                        console.log({ cookies });
                        cookies.forEach((cookie) => {
                            setCookie(resp.headers, cookie);
                        });
                    },
                },
            });
            const { data, error } = await serverClient.auth
                .exchangeCodeForSession(code);
            console.log({ data, error });
            // console.log(await serverClient.auth.getUser());
            const headers = new Headers();
            headers.set("location", "/login");
            // return new Response(null, { status: 303, headers });
        } else {
            // const { data, error } = await serverClient.auth.getUser();
            // console.log({ data, error });
            // const val = await serverClient.auth.signInWithOAuth({
            //     provider: "discord",
            //     options: { redirectTo: redirect_url },
            // });
            // console.log(val.data.url);
            const { data, error } = await serverClient(cookies).auth.getUser();
            console.log({ data, error });
        }

        return resp;
    },
};

export default defineRoute(async (req, ctx) => {
    const client = ctx.state.signal;

    const url = new URL(req.url);
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";
    // const cookies = getCookies(req.headers);

    // await serverClient.auth.signOut();
    // console.log({ resp });
    // console.log(await serverClient.from("users").select());
    // console.log({ code, next, cookies, url, origin });
    // console.log({ headers: req.headers });
    return (
        <div>
            <Signin
                redirect_url={redirect_url}
            />
        </div>
    );
});
