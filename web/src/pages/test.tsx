// pages/index.tsx
import { useState, useEffect } from "react";
import { BskyAgent } from "@atproto/api";
import { OpenAI } from "openai";

const agent = new BskyAgent({
  service: "https://bsky.social",
});

const MyComponent = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await agent.login({
        identifier: identifier,
        password: password,
      });
      setIsLoggedIn(true);
      await fetchTimeline();
    } catch (err) {
      setError("ログインに失敗しました。認証情報を確認してください。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const timeline = await agent.getTimeline({
        limit: 20,
      });
      const transformedPosts = await transformPosts(timeline.data.feed);
      setPosts(transformedPosts);
    } catch (err) {
      setError("タイムラインの取得に失敗しま���た。");
      console.error(err);
    }
  };

  const transformText = async (text) => {
    const openai = new OpenAI({
      apiKey: openAiApiKey,
      dangerouslyAllowBrowser: true,
    });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "懐かしい2chの書き込みみたいな文体に修正してください"
          },
          {
            role: "user",
            content: text
          }
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error transforming text:", error);
      return text;
    }
  };
  const transformPosts = async (posts) => {
    return await Promise.all(
      posts.map(async (post) => {
        const transformedText = await transformText(post.post.record.text);
        return {
          ...post,
          post: {
            ...post.post,
            record: {
              ...post.post.record,
              text: transformedText,
            },
          },
        };
      })
    );
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTimeline();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white border border-gray-300">
          <div>
            <h2 className="text-center text-3xl font-extrabold">
              Blueskyにログイン
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  メールアドレスまたはハンドル
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 text-black"
                  placeholder="メールアドレスまたはハンドル"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 text-black"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="openai-api-key" className="block text-sm font-medium text-gray-700">
                  OpenAI API Key
                </label>
                <input
                  id="openai-api-key"
                  name="openai-api-key"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 text-black"
                  placeholder="OpenAI API Key"
                  value={openAiApiKey}
                  onChange={(e) => setOpenAiApiKey(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="block w-full py-2 px-4 border border-gray-300 text-sm font-medium text-black bg-gray-200 hover:bg-gray-300"
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">タイムライン</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.post.cid}
            className="p-4 border border-gray-300"
          >
            <div className="mb-2">
              <div className="font-bold">{post.post.author.displayName}</div>
              <div className="text-gray-500">@{post.post.author.handle}</div>
            </div>
            <p className="text-black">{post.post.record.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyComponent;
