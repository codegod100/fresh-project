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

export default async function (req, { Component, state }: PageProps) {
    const creds = state.supaCreds;
    const signal = state.signal;
    const client = state.client;
    const cookies = getCookies(req.headers);
    const sc = serverClient(cookies);
    const { data, error } = await sc.auth.getUser();
    console.log({ data, error });
    const userRecord = await sc.from("users").select().eq(
        "user_id",
        data.user?.id,
    ).single();
    console.log({ userRecord });
    const username = userRecord.data.username;
    return (
        <div class="layout">
            <SupaClient supaCreds={creds} signal={signal} />
            {/* <Server client={state.ssrclient} /> */}
            <div class="flex flex-row">
                <Search client={signal} />
                <div class="grow text-right">{username}</div>
            </div>
            <div>
            </div>
            <div class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
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
