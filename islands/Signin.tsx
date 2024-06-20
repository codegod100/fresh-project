import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

async function signin(supabase: SupabaseClient, redirect_url: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
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
    supabase_url: string;
    anon_key: string;
    redirect_url: string;
}

async function handler(supabase: SupabaseClient) {
    const resp = await supabase.auth.getUser();
    if (!resp.error) {
        window.location.href = "/";
    }
    // console.log({ resp });
}

export default function (props: SigninProps) {
    const { supabase_url, anon_key, redirect_url } = props;
    const supabase = createClient(
        supabase_url,
        anon_key,
    );
    globalThis.addEventListener("load", () => handler(supabase));

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.provider_token) {
            window.localStorage.setItem(
                "oauth_provider_token",
                session.provider_token,
            );
        }

        if (session && session.provider_refresh_token) {
            window.localStorage.setItem(
                "oauth_provider_refresh_token",
                session.provider_refresh_token,
            );
        }

        if (session && session.access_token) {
            // await fetch("/token", {
            //     method: "POST",
            //     body: JSON.stringify({ token: session.access_token }),
            // });

            window.localStorage.setItem(
                "access_token",
                session.access_token,
            );
        }

        if (event === "SIGNED_OUT") {
            window.localStorage.removeItem("oauth_provider_token");
            window.localStorage.removeItem("oauth_provider_refresh_token");
        }
    });
    return (
        <div>
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 m-5 rounded"
                onClick={() => signin(supabase, redirect_url)}
            >
                Login
            </button>
        </div>
    );
}
