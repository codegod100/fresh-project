import { defineRoute } from "$fresh/server.ts";
import { getCookies, setCookie } from "jsr:@std/http/cookie";
import { FreshContext, RouteContext } from "$fresh/src/server/types.ts";
import { createServerClient } from "npm:@supabase/ssr";
import Redirect from "../islands/Redirect.tsx";

interface Cookie {
    name: string;
    value: string;
}

const redirect_url = Deno.env.get("REDIRECT_URL") as string;
export const handler = {
    async GET(req: Request, ctx: FreshContext) {
        let redirect = "";
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        const supabase_url = Deno.env.get("SUPABASE_URL") as string;
        const anon_key = Deno.env.get("ANON_KEY") as string;
        const cookies = getCookies(req.headers);
        const allCookies: Cookie[] = [];
        for (const cookie in cookies) {
            allCookies.push({ name: cookie, value: cookies[cookie] });
        }
        function getAllCookies(): Promise<Cookie[]> {
            return new Promise((resolve) => {
                resolve(allCookies);
            });
        }
        const cookiesToSet: Cookie[] = [];
        const serverClient = createServerClient(supabase_url, anon_key, {
            cookies: {
                getAll: getAllCookies,
                setAll: (cookies) => {
                    console.log({ cookies });
                    cookies.forEach((cookie) => {
                        cookiesToSet.push(cookie);
                    });
                },
            },
        });
        if (code) {
            const { data, error } = await serverClient.auth
                .exchangeCodeForSession(code);
            console.log({ data, error });
            const { data: userData, error: _userError } = await serverClient
                .from("users")
                .select()
                .eq("user_id", data.user!.id)
                .single();
            if (!userData) {
                const { data: userData, error: userError } = await serverClient
                    .from("users")
                    .insert({
                        user_id: data.user!.id,
                        username: data.user!.user_metadata.custom_claims
                            .global_name,
                    });
                console.log({ userData, userError });
            }
        } else {
            const val = await serverClient.auth.signInWithOAuth({
                provider: "discord",
                options: { redirectTo: redirect_url },
            });
            redirect = val.data.url!;
            console.log(val.data.url);
        }
        const resp = await ctx.render({ redirect });
        cookiesToSet.forEach((cookie) => setCookie(resp.headers, cookie));
        console.log(resp.headers);
        return resp;
    },
};

interface Data {
    redirect: string; // redirect url
}

export default defineRoute((req, ctx: RouteContext) => {
    const { redirect } = ctx.data as Data;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    return (
        <div>
            {code && <Redirect path="/" />}
            {!code && <Redirect path={redirect} />}
        </div>
    );
});
