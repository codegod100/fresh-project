const kv = await Deno.openKv();
import { Database } from "../types/supabase.ts";

import { createServerClient } from "@supabase/ssr";

import { getCookies, setCookie } from "@std/http/cookie";

interface Cookie {
    name: string;
    value: string;
}
export function serverClient(req: Request) {
    const cookies = getCookies(req.headers);
    const supabase_url = Deno.env.get("SUPABASE_URL") as string;
    const anon_key = Deno.env.get("ANON_KEY") as string;
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
    return createServerClient<Database>(supabase_url, anon_key, {
        cookies: {
            getAll: getAllCookies,
            setAll: (cookies) => {
                console.log({ cookies });
            },
        },
    });
}

export function redirect(path: string) {
    const headers = new Headers();
    headers.set("location", path);
    return new Response(null, {
        status: 303, // See Other
        headers,
    });
}
