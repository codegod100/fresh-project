import { useSignal } from "@preact/signals";

export default function () {
    let clicked = useSignal(false);
    function showReply() {
        clicked.value = true;
    }
    const post = (
        <div>
        </div>
    );
    return (
        <div>
            <div id="response">
                <div>
                    <button onClick={showReply}>Reply</button>
                </div>
            </div>
            <div>
                {clicked.value && (
                    <div>
                        <textarea class="border"></textarea>
                        <button>Submit</button>
                    </div>
                )}
            </div>
        </div>
    );
}
