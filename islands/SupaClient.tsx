import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal } from "@preact/signals";
import { Database } from "../types/supabase.ts";
interface ReplyProps {
    supaCreds: [string, string];
    signal: Signal<SupabaseClient>;
}
export default function (props: ReplyProps) {
    const client = createClient<Database>(...props.supaCreds);
    props.signal.value = client;
    return <div></div>;
}
