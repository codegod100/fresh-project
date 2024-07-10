import { PageProps } from "$fresh/server.ts";

interface Data {
    posts: {
        id: number;
        category: string;
        created_at: string;
        title: string;
        body: string;
        users: { username: string };
        communities: { name: string };
    }[];
}
export default function (props: Data) {
    const postsJSX = props.posts.map((post) => (
        <a
            href={`/communities/${post.communities.name}/${post.id}`}
        >
            <div class="mb-2">
                <div>
                    Title: {post.title}{" "}
                    {post.category && <span>[{post.category}]</span>}
                </div>
                <div>Body: {post.body}</div>
                <div>
                    Published: {new Date(post.created_at).toLocaleString()}
                </div>
                <div>Community: {post.communities.name}</div>
                <div>
                    Author: {post.users.username}
                </div>
            </div>
        </a>
    ));
    return <div>{postsJSX}</div>;
}
