import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { FaRegComment } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { IoIosHeart } from "react-icons/io";
import io from "socket.io-client";

function Search() {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigation = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      await getFeed();
      await getUsers();
      setLoading(false);
    })();
  }, []);
  useEffect(() => {
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`);

    socket.on("post-created", (posts) => {
      setPosts(posts);
    });

    socket.on("feed-likes-updated", (feedPosts) => {
      setPosts(feedPosts);
    });
  }, []);
  useEffect(() => {
    if (term.length > 0 && posts.length > 0) {
      let filteredPosts = posts.filter((post) =>
        post.text.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filteredPosts);
    }
    return () => setSearchResults([]);
  }, [term, posts]);

  async function getFeed() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/feed`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      console.log(err);
    }
  }
  async function getUsers() {
    try {
      const res = await fetch(`${import.meta.env.VITE_PROD_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function likePost(authorId, postId) {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${authorId}/posts/${postId}/likes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
  async function unlikePost(authorId, postId, likeId) {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${authorId}/posts/${postId}/likes/${likeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
  function getUsername(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.username;
  }
  function goToPost(userId, postId) {
    navigation(`/home/${userId}/posts/${postId}`);
  }
  function goToProfile(id) {
    navigation(`/home/${id}`);
  }
  function getUserProfileUrl(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.profileUrl;
  }
  if (loading)
    return (
      <div
        style={{
          color: "#e6e8e6",
          flex: 2,
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  return (
    <div className="PostsSearch">
      <div className="searchBar">
        <input
          type="search"
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Find posts"
        />
      </div>
      <div className="searchResults">
        {searchResults.length > 0 ? (
          searchResults.map((post, i) => (
            <div className="post-card" key={i}>
              <div className="card-pic-cont">
                <div
                  className="card-pic
                    "
                >
                  {getUserProfileUrl(post.authorId) === null ? (
                    <img src="/images/blank-profile-picture-973460_1280.png" />
                  ) : (
                    <img src={getUserProfileUrl(post.authorId)} />
                  )}
                </div>
              </div>
              <div className="card-details">
                <div
                  className="username-options"
                  onClick={() => goToProfile(post.authorId)}
                >
                  <div className="username">
                    {typeof post !== "undefined" && getUsername(post.authorId)}
                  </div>
                  <div className="card-username">
                    @{typeof post !== "undefined" && getUsername(post.authorId)}
                  </div>
                </div>
                <div
                  className="card-post"
                  onClick={() => goToPost(post.authorId, post.id)}
                >
                  <div className="card-text">
                    {typeof post !== "undefined" && post.text}
                  </div>
                  {typeof post !== "undefined" &&
                    typeof post.imageUrl !== "undefined" &&
                    post.imageUrl !== null &&
                    post.imageUrl !== "" && (
                      <div className="card-image">
                        <img src={post.imageUrl} />
                      </div>
                    )}
                </div>
                <div className="comments-likes">
                  <div className="post-comments">
                    <FaRegComment color="grey" className="icon" />
                    <div style={{ color: "grey" }}>{post.comments.length}</div>
                  </div>

                  {post.likes.length > 0 ? (
                    post.likes
                      .map((x) => x.likedById)
                      .indexOf(Number(userId)) !== -1 ? (
                      <div
                        className="post-likes"
                        onClick={() =>
                          unlikePost(
                            post.authorId,
                            post.id,
                            post.likes[
                              post.likes
                                .map((x) => x.likedById)
                                .indexOf(Number(userId))
                            ]
                          )
                        }
                      >
                        <IoIosHeart color="red" className="icon" />

                        <div style={{ color: "grey" }}>{post.likes.length}</div>
                      </div>
                    ) : (
                      <div
                        className="post-likes"
                        onClick={() => likePost(post.authorId, post.id)}
                      >
                        <FaRegHeart color="grey" className="icon" />

                        <div style={{ color: "grey" }}>{post.likes.length}</div>
                      </div>
                    )
                  ) : (
                    <div
                      className="post-likes"
                      onClick={() => likePost(post.authorId, post.id)}
                    >
                      <FaRegHeart key={i} color="grey" className="icon" />
                      <div style={{ color: "grey" }}>{post.likes.length}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : searchResults.length === 0 && term.length > 0 ? (
          <div
            style={{
              color: "#e6e8e6",
              textAlign: "center",
              margin: "10px",
            }}
          >
            Could not be found
          </div>
        ) : (
          <div
            style={{
              color: "#e6e8e6",
              textAlign: "center",
              margin: "10px",
            }}
          >
            Discover new posts
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
