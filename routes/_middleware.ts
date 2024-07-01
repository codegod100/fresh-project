import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "jsr:@std/http/cookie";
import { User } from "./lib.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal, signal } from "@preact/signals";

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
    ctx.state.supaCreds = [supabase_url, anon_key];
    let empty: SupabaseClient;
    const s = signal<SupabaseClient>(empty);
    ctx.state.signal = s;
    ctx.state.client = createClient(supabase_url, anon_key);
    const resp = await ctx.next();
    return resp;
}
