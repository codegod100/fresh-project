export default function Post() {
    return (
        <div>
            <form>
                Title
                <input type="input" name="title"></input>
                Body
                <input type="textarea" name="body"></input>
            </form>
        </div>
    );
}

export const handler = {
    async GET(req, ctx) {
        const user = ctx.state.user;
        console.log({ user });
        return ctx.render();
    },
};
