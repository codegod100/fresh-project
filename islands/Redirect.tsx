import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";

export default function (props) {
    if (IS_BROWSER) {
        window.location.href = props.path;
    }
    return <div></div>;
}
