import { defineRoute } from "$fresh/src/server/defines.ts";
import { FreshContext } from "$fresh/server.ts";
import { serverClient } from "../lib.ts";

export default defineRoute((req, ctx) => {
    return (
        <div>
            <form method="POST">
                Community name
                <input type="text" name="name" class="input"></input>
            </form>
        </div>
    );
});

export const handler = {
    async POST(req: Request, ctx: FreshContext) {
        const form = await req.formData();
        const name = form.get("name") as string;
        const client = serverClient(req);
        const { data: result, error } = await client.auth.getUser();
        console.log({ result, error });
        const { data: userRecord, error: userError } = await client
            .from("users")
            .select()
            .eq("user_id", result.user.id)
            .single();
        console.log({ userRecord, userError });
        const { data: community, error: communityError } = await client
            .from("communities")
            .insert({ name, creator_id: userRecord?.id })
            .select()
            .single();
        console.log({ community, communityError });

        return ctx.render();
    },
};
