import { Button } from "../components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
async function setName() {
    console.log("OHHH");
    if (!IS_BROWSER) {
        console.log("YOOO");
        const kv = await Deno.openKv();
        const pdata = await kv.get(["preferences", "ada"]);
        console.log(pdata.value);
    }
}
export default function Yolo(props) {
    return <Button onClick={async () => await setName()}>Sup</Button>;
}
