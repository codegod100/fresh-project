import { instantiate } from "../lib/rs_lib.generated.js";
const { Greeter } = await instantiate();
export default function (props) {
    const greeter = new Greeter(props.name);
    return <div>{greeter.greet()}</div>;
}
