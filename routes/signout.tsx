import { defineRoute } from "$fresh/server.ts";
import { getCookies } from "jsr:@std/http/cookie";
import { redirect, serverClient } from "./lib.ts";

export default defineRoute(async (req, ctx) => {
    let sc = serverClient(req);
    const error = await sc.auth.signOut();
    if (error) {
        // throw error;
    }
    return redirect("/");
});
