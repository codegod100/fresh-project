import { IS_BROWSER } from "$fresh/runtime.ts";
async function handler(client) {
    console.log(client);
    const { data, error } = await client.from("posts").select();
    console.log("server island");
    console.log(data, error);
}
export default function (props) {
    console.log({ server_client: props.client });
    // console.log(props.signal.value.auth.getUser());
    // console.log(props.client.auth.getUser());
    if (IS_BROWSER) {
        handler(props.client);
    }
    return <div></div>;
}
