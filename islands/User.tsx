import { signal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";

const username = signal(<div></div>);
async function handler(client) {
    console.log({ client });
    const user = await client.value.auth.getUser();
    console.log({ user });
    const userRecord = await client.value.from("users").select().eq(
        "user_id",
        user.data.user.id,
    ).single();
    console.log({ user }, { userRecord });
    username.value = userRecord.data.username;
}
export default function (props, ctx) {
    // handler(props.client);
    if (IS_BROWSER) {
        handler(props.client);
    }
    // globalThis.addEventListener("load", () => handler(props.client));
    return <div class="grow text-right">{username}</div>;
}
