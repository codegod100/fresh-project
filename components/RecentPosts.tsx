import { PageProps } from "$fresh/server.ts";

interface Data {
    posts: {
        id: number;
        category: string;
        title: string;
        body: string;
        users: { username: string };
        communities: { name: string };
    }[];
}
export default function (props: Data) {
    const postsJSX = props.posts.map((post) => (
        <div class="mb-2">
            <div>
                Title:{" "}
                <a
                    href={`/communities/${post.communities.name}/${post.id}`}
                >
                    {post.title}
                </a>{" "}
                {post.category && <span>[{post.category}]</span>}
            </div>
            <div>Body: {post.body}</div>
            <div>Community: {post.communities.name}</div>
            <div>
                Author: {post.users.username}
            </div>
        </div>
    ));
    return <div>{postsJSX}</div>;
}
