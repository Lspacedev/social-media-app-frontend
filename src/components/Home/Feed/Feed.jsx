import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaRegComment } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { IoIosHeart } from "react-icons/io";
import io from "socket.io-client";

import CreatePost from "./CreatePost";
function Feed() {
  const [posts, setPosts] = useState([]);
  const [forYouPosts, setForYouPosts] = useState([]);
  const [followingPosts, setFolllowingPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("fyp");

  const navigation = useNavigate();
  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");
  useEffect(() => {
    (async () => {
      setLoading(true);

      await getUsers();

      if (currentTab === "fyp") {
        await getFeed();
      } else {
        await getFollowingPosts();
      }
      setLoading(false);
    })();
  }, [currentTab]);

  useEffect(() => {
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`, {
      transports: ["websocket"],
      withCredentials: true,
    });

    const handlePostsUpdate = (posts) => {
      setPosts(posts);
    };

    const handleFeedUpdate = (feedPosts) => {
      if (currentTab === "fyp") {
        setPosts(feedPosts);
      }
    };
    const handleFollowingUpdate = (followingPosts) => {
      if (currentTab === "flw") {
        setPosts(followingPosts);
      }
    };
    socket.on("post-created", handlePostsUpdate);

    socket.on("feed-likes-updated", handleFeedUpdate);

    socket.on("following-likes-updated", handleFollowingUpdate);

    return () => {
      socket.off("post-created", handlePostsUpdate);

      socket.off("feed-likes-updated", handleFeedUpdate);

      socket.off("following-likes-updated", handleFollowingUpdate);
    };
  }, [currentTab]);
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
      setForYouPosts(data.posts);
    } catch (err) {
      console.log(err);
    }
  }
  async function getFollowingPosts() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/followingFeed`,
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
      if (res) {
        setLoading(false);
      }
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
      if (res) {
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
  function getUsername(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.username;
  }
  function getUserProfile(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.profileUrl;
  }
  function goToPost(userId, postId) {
    navigation(`/home/${userId}/posts/${postId}`);
  }
  function goToProfile(id) {
    navigation(`/home/${id}`);
  }
  function handleHamBurgerMenu() {
    const sidebar = document.querySelector(".SideNavigation");
    sidebar.classList.toggle("active");
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
    <div className="Feed">
      <div className="feed-header">
        <div className="logo-ham">
          <div className="hamburger-menu" onClick={handleHamBurgerMenu}>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="logo">RANT</div>
        </div>
        <div className="all-following">
          <div
            className={currentTab === "fyp" ? "fyp currentTab" : "fyp"}
            onClick={() => {
              setCurrentTab("fyp");
            }}
          >
            For You
          </div>
          <div
            className={currentTab === "flw" ? "flw currentTab" : "flw"}
            onClick={() => {
              setCurrentTab("flw");
            }}
          >
            Following
          </div>
        </div>
      </div>

      <CreatePost />
      <div className="posts">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <div className="post-card" key={i}>
              <div className="card-pic-cont">
                <div
                  className="card-pic
                    "
                >
                  {getUserProfile(post.authorId) === null ? (
                    <img src="/images/blank-profile-picture-973460_1280.png" />
                  ) : (
                    <img src={getUserProfile(post.authorId)} />
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
        ) : (
          <div
            style={{
              color: "#e6e8e6",
              textAlign: "center",
              margin: "10px",
            }}
          >
            No posts.
          </div>
        )}
      </div>
    </div>
  );
}

const logo = {
  fontSize: "52rem",
  fontWeight: "400",
  fontStyle: "normal",
  fontFamily: "Silkscreen, serif",
  webkitTextStroke: "3px #E6E8E6",
  marginTop: "-4rem",
};
export default Feed;
