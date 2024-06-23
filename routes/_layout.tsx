import { PageProps } from "$fresh/server.ts";
import { FreshConfig, FreshContext } from "$fresh/src/server/types.ts";
import { Signal, useSignal } from "@preact/signals";
import SupaClient from "../islands/SupaClient.tsx";
import { State } from "./_middleware.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import Search from "../islands/Search.tsx";

export default function (
    { Component, state }: PageProps,
) {
    const creds = state.supaCreds;
    const signal = state.signal;
    return (
        <div class="layout">
            <SupaClient supaCreds={creds} signal={signal} />
            <div>
                <Search client={signal} />
            </div>
            <div class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <a href="/">{Deno.env.get("SITE_NAME")}</a>
            </div>
            <Component />
        </div>
    );
}
