import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";

import { IoArrowBackOutline } from "react-icons/io5";
import { FaRegComment } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";

import { IoIosHeart } from "react-icons/io";
import { SlOptions } from "react-icons/sl";
import { MdDeleteOutline } from "react-icons/md";
import io from "socket.io-client";

function Post() {
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [commentText, setCommentText] = useState("");

  const user = localStorage.getItem("userId");

  const token = localStorage.getItem("token");
  const { userId, postId } = useParams();
  const [currentComment, setCurrentComment] = useState(0);
  const [isOptions, setIsOptions] = useState(false);
  const navigation = useNavigate();
  function goBack() {
    navigation("/home");
  }
  useEffect(() => {
    (async () => {
      await getPost();
      await getUsers();
      setLoading(false);
    })();
  }, [postId]);
  useEffect(() => {
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`, {
      transports: ["websocket"],
    });

    socket.on("updated-comment", (post) => {
      setPost(post);
    });

    socket.on("like-updated", (post) => {
      setPost(post);
    });
  }, []);
  async function getUsers() {
    try {
      const res = await fetch(`${import.meta.env.VITE_PROD_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();

        setUsers(data.users);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function getPost() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/posts/${postId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();

        setPost(data.post);
      }
    } catch (err) {
      console.log(err);
    }
  }
  function getUsername(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.username;
  }
  async function likePost(postId) {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${userId}/posts/${postId}/likes`,
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
  async function unlikePost(postId, likeId) {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${userId}/posts/${postId}/likes/${likeId}`,
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
  async function createComment(e) {
    e.preventDefault();

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${userId}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commentText }),
        }
      );

      if (res) {
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function deleteComment() {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${userId}/posts/${postId}/comments/${currentComment}`,
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
    <div className="Post">
      <div className="post-nav">
        <button onClick={goBack}>
          <IoArrowBackOutline className="icon" />
          <div>Post</div>
        </button>
      </div>
      <div className="post-card">
        <div className="card-pic-cont">
          <div>
            <div
              className="card-pic
                    "
            >
              {getUserProfileUrl(post.authorId) === null ||
              getUserProfileUrl(post.authorId) === "" ? (
                <img src="/images/blank-profile-picture-973460_1280.png" />
              ) : (
                <img src={getUserProfileUrl(post.authorId)} />
              )}
            </div>
          </div>

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
        </div>
        <div className="card-details">
          <div className="card-post">
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
          <div className="card-timestamp">
            {typeof post !== "undefined" &&
              new Date(post.timestamp).toDateString()}
          </div>
          <div className="comments-likes">
            <div className="post-comments">
              <FaRegComment color="grey" className="icon" />
              <div style={{ color: "grey" }}>
                {typeof post !== "undefined" && post.comments.length}
              </div>
            </div>

            {typeof post !== "undefined" && post.likes.length > 0 ? (
              post.likes.map((x) => x.likedById).indexOf(Number(user)) !==
              -1 ? (
                <div
                  className="post-likes"
                  onClick={() =>
                    unlikePost(
                      post.id,
                      post.likes[
                        post.likes.map((x) => x.likedById).indexOf(Number(user))
                      ]
                    )
                  }
                >
                  <IoIosHeart color="red" className="icon" />

                  <div style={{ color: "grey" }}>{post.likes.length}</div>
                </div>
              ) : (
                <div className="post-likes" onClick={() => likePost(post.id)}>
                  <FaRegHeart color="grey" className="icon" />

                  <div style={{ color: "grey" }}>{post.likes.length}</div>
                </div>
              )
            ) : (
              <div className="post-likes" onClick={() => likePost(post.id)}>
                <FaRegHeart color="grey" className="icon" />
                <div style={{ color: "grey" }}>
                  {typeof post !== "undefined" && post.likes.length}
                </div>
              </div>
            )}
          </div>
          <div className="post-comment">
            <div className="commentArea">
              <textarea
                placeholder="Post comment"
                onChange={(e) => setCommentText(e.target.value)}
              ></textarea>
            </div>
            <div className="comment-content">
              <button onClick={createComment}>Post</button>
            </div>
          </div>
        </div>
      </div>
      <div className="comments">
        {typeof post !== "undefined" && post.comments.length > 0 ? (
          post.comments.map((comment, i) => (
            <div className="comment-card" key={i}>
              <div className="card-pic-cont">
                <div
                  className="card-pic
             "
                >
                  {getUserProfileUrl(comment.authorId) === null ||
                  getUserProfileUrl(comment.authorId) === "" ? (
                    <img src="/images/blank-profile-picture-973460_1280.png" />
                  ) : (
                    <img src={getUserProfileUrl(comment.authorId)} />
                  )}
                </div>
              </div>
              <div className="card-details">
                <div className="username-options">
                  {isOptions && currentComment === comment.id && (
                    <div className="options-modal">
                      <div
                        className="option"
                        onClick={() => {
                          deleteComment();
                          setIsOptions(false);
                        }}
                      >
                        <MdDeleteOutline color="#e6e8e6" />
                        <div>Delete</div>
                      </div>
                    </div>
                  )}
                  <div
                    style={{ display: "flex" }}
                    onClick={() => goToProfile(comment.authorId)}
                  >
                    <div style={{ color: "#e6e8e6" }}>
                      {getUsername(comment.authorId)}
                    </div>
                    <div className="card-username">
                      @{getUsername(comment.authorId)}
                    </div>
                  </div>

                  {comment.authorId == user && (
                    <button
                      onClick={() => {
                        setCurrentComment(comment.id);
                        setIsOptions(!isOptions);
                      }}
                    >
                      <SlOptions color="grey" />
                    </button>
                  )}
                </div>

                <div className="card-post">{comment.commentText}</div>
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
            No comments.
          </div>
        )}
      </div>
    </div>
  );
}
export default Post;
