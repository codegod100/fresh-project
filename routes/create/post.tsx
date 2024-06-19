import { defineRoute } from "$fresh/server.ts";
import CreatePost from "../../islands/CreatePost.tsx";
const supabase_url = Deno.env.get("SUPABASE_URL") as string;
const anon_key = Deno.env.get("ANON_KEY") as string;
export default defineRoute(async (req, ctx) => {
    return <CreatePost supabase_url={supabase_url} anon_key={anon_key} />;
});
