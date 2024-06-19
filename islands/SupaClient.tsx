import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { Signal } from "@preact/signals";
interface ReplyProps {
    supaCreds: [string, string];
    signal: Signal<SupabaseClient>;
}
export default function (props: ReplyProps) {
    const client = createClient(...props.supaCreds);
    props.signal.value = client;
    return <div></div>;
}
