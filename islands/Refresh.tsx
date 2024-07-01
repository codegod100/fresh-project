import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
export default function ({ creds }: { creds: [string, string] }) {
    const refresh = createClient(...creds);
    return (
        <div>
            <button
                onClick={async () => {
                    refresh.realtime.setAuth("fresh-token");
                    // const resp = await fetch("/refresh");
                    // console.log(await resp.json());
                }}
            >
                Refresh
            </button>
        </div>
    );
}
