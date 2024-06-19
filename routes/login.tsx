import { defineRoute } from "$fresh/server.ts";
import Signin from "../islands/Signin.tsx";
const supabase_url = Deno.env.get("SUPABASE_URL") as string;
const anon_key = Deno.env.get("ANON_KEY") as string;
export default defineRoute(async (req, ctx) => {
    return (
        <div>
            <Signin anon_key={anon_key} supabase_url={supabase_url} />
        </div>
    );
});
