import { PageProps } from "$fresh/server.ts";
import { FreshConfig, FreshContext } from "$fresh/src/server/types.ts";
import { Signal, useSignal } from "@preact/signals";
import SupaClient from "../islands/SupaClient.tsx";
import { State } from "./_middleware.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import Search from "../islands/Search.tsx";
import User from "../islands/User.tsx";
import Server from "../islands/Server.tsx";
import { serverClient } from "./lib.ts";
import { getCookies } from "jsr:@std/http/cookie";

export default async function (req: Request, { Component, state }: PageProps) {
    const creds = state.supaCreds;
    const signal = state.signal;
    const client = state.client;
    const sc = serverClient(req);
    const { data, error } = await sc.auth.getUser();
    const userRecord = await sc.from("users").select().eq(
        "user_id",
        data.user?.id,
    ).single();
    const username = userRecord.data?.username;
    return (
        <div class="layout">
            <div class="flex flex-row">
                <Search client={signal} />
                {username && (
                    <div class="grow text-right">
                        Hello {username} [<a href="/signout">Signout</a>]
                    </div>
                )}
                {!username && (
                    <div class="grow text-right">
                        <a href="/login">Login</a>
                    </div>
                )}
            </div>
            <div>
            </div>
            <div class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl ">
                <a href="/">{Deno.env.get("SITE_NAME")}</a>
            </div>
            <Component />
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
    },
};
