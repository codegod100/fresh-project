import { PageProps } from "$fresh/server.ts";
import Search from "../islands/Search.tsx";
import { serverClient } from "./lib.ts";

export default async function (req: Request, { Component, state }: PageProps) {
    const signal = state.signal;
    const sc = serverClient(req);
    const { data, error } = await sc.auth.getUser();
    let username = "";
    if (!error) {
        const userRecord = await sc.from("users").select().eq(
            "user_id",
            data.user!.id,
        ).single();
        username = userRecord.data!.username!;
    }

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
            <div class="mb-4 text-5xl font-extrabold leading-none tracking-tight text-gray-900 ">
                <a href="/">{Deno.env.get("SITE_NAME")}</a>
            </div>
            <Component />
        </div>
    );
}
