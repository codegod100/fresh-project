export default function (props) {
    console.log({ results: props });
    return (
        <div>
            {props.results}
        </div>
    );
}
