import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal } from "@preact/signals";

async function signin(supabase: Signal, redirect_url: string) {
    const { data, error } = await supabase.value.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: redirect_url },
    });
    console.log({ data });
    return { data, error };
}

async function getSession(supabase: SupabaseClient) {
    const { data, error } = await supabase.auth.getUser();
    console.log({ data }, { error });
}

interface SigninProps {
    client: Signal;
    redirect_url: string;
}

async function handler(supabase: SupabaseClient) {
    // const resp = await supabase.auth.getUser();
    // if (!resp.error) {
    //     window.location.href = "/";
    // }
    // console.log({ resp });
}

async function signout(client) {
    await client.auth.signOut();
}

export default function (props: SigninProps) {
    const { client: supabase, redirect_url } = props;
    // console.log({ supabase });
    globalThis.addEventListener("load", () => handler(supabase));

    // supabase.auth.onAuthStateChange(async (event, session) => {
    //     if (session && session.provider_token) {
    //         window.localStorage.setItem(
    //             "oauth_provider_token",
    //             session.provider_token,
    //         );
    //     }

    //     if (session && session.provider_refresh_token) {
    //         window.localStorage.setItem(
    //             "oauth_provider_refresh_token",
    //             session.provider_refresh_token,
    //         );
    //     }

    //     if (session && session.access_token) {
    //         // await fetch("/token", {
    //         //     method: "POST",
    //         //     body: JSON.stringify({ token: session.access_token }),
    //         // });

    //         window.localStorage.setItem(
    //             "access_token",
    //             session.access_token,
    //         );
    //     }

    //     if (event === "SIGNED_OUT") {
    //         window.localStorage.removeItem("oauth_provider_token");
    //         window.localStorage.removeItem("oauth_provider_refresh_token");
    //     }
    // });
    console.log({ redirect_url });

    return (
        <div>
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 m-5 rounded"
                onClick={() => signin(supabase, redirect_url)}
            >
                Login
            </button>
            <buton onClick={() => signout(supabase)}>Signout</buton>
        </div>
    );
}
