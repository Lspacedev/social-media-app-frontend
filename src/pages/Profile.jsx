import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { IoArrowBackOutline } from "react-icons/io5";
import { CgClose } from "react-icons/cg";
import { FaRegComment } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import { MdOutlineEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { IoIosHeart } from "react-icons/io";
import { FaRegEnvelope } from "react-icons/fa";
import parseJwt from "../utils/checkToken";

import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { FaImage } from "react-icons/fa6";

function Profile() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isUpdatePost, setIsUpdatePost] = useState(false);

  const [isOptions, setIsOptions] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    username: "",
  });
  const [updatedPost, setUpdatedPost] = useState({
    text: "",
  });
  const [images, setImages] = useState([]);
  const [image, setImage] = useState();

  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");
  const [currentTab, setCurrentTab] = useState("Posts");
  const [currentPost, setCurrentPost] = useState(0);
  const postsRef = useRef(null);
  const { profile } = useParams();
  const navigation = useNavigate();
  useEffect(() => {
    getProfile();
    getPosts();
    getLikedPosts();
    getUsers();
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`);

    const loggedProfileUpdate = (user) => {
      if (profile === userId) {
        setUser(user);
      }
    };
    const targetProfileFollowUpdate = (user) => {
      if (Number(profile) === user.id) {
        setUser(user);
      }
    };
    const loggedProfileFollowUpdate = (user) => {
      if (profile === userId) {
        setUser(user);
      }
    };
    socket.on("profile-update", loggedProfileUpdate);

    socket.on("target-profile-follow-update", targetProfileFollowUpdate);

    socket.on("logged-profile-follow-update", loggedProfileFollowUpdate);

    socket.on("post-updated", (posts) => {
      setPosts(posts);
    });
    socket.on("profile-likes-updated", (profilePosts) => {
      if (profile === userId) {
        setPosts(profilePosts);
      }
    });

    socket.on("liked-posts-updated", (likedPosts) => {
      if (profile === userId) {
        setLikedPosts(likedPosts);
      }
    });
    socket.on("target-profile-likes-updated", (targetProfilePosts) => {
      if (profile != userId) {
        setPosts(targetProfilePosts);
      }
    });
    socket.on("target-liked-posts-updated", (targetLikedPosts) => {
      if (profile != userId) {
        setLikedPosts(targetLikedPosts);
      }
    });

    return () => {
      socket.off("target-profile-follow-update", targetProfileFollowUpdate);
      socket.off("logged-profile-follow-update", loggedProfileFollowUpdate);
    };
  }, [profile, userId]);
  function handleInputChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  }
  function handleTextChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    setUpdatedPost((prev) => ({ ...prev, [name]: value }));
  }
  function closeForm() {
    setIsUpdate(false);
  }
  function goBack() {
    navigation("/home");
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
  async function getProfile() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setUpdatedUser((prev) => ({ ...prev, username: data.user.username }));
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function getPosts() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}/posts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function getLikedPosts() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}/likedPosts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setLikedPosts(data.likedPosts);
      }
    } catch (err) {
      console.log(err);
    }
  }
  function handleProfilePicUpload(e) {
    let file = e.target.files[0];
    let profilePic = new File(
      [file],
      "profilePic" + "." + file.name.substring(file.name.indexOf(".") + 1),
      {
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
      }
    );
    setImages((prev) => [...prev, profilePic]);
  }
  function handleCoverPicUpload(e) {
    let file = e.target.files[0];
    let cover = new File(
      [file],
      "cover" + "." + file.name.substring(file.name.indexOf(".") + 1),
      {
        lastModified: file.lastModified,
        size: file.size,
        type: file.type,
      }
    );
    setImages((prev) => [...prev, cover]);
  }
  async function updateProfile() {
    setLoading(true);
    console.log({ images });
    if (updatedUser.username === "" && images.length === 0) {
      alert("Nothing to update");
      return;
    }
    const formData = new FormData();
    if (updatedUser.username !== "") {
      formData.append("username", updatedUser.username);
    }

    if (images.length > 0) {
      Object.values(images).forEach((file) => {
        console.log({ file });
        formData.append("image", file);
      });
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res) {
        setImages([]);

        setLoading(false);
        setIsUpdate(false);
        getProfile();
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function updatePost() {
    setLoading(true);
    const formData = new FormData();
    if (updatedPost.text !== "") {
      formData.append("text", updatedPost.text);
    }

    if (typeof image !== "undefined") {
      formData.append("image", image);
    }
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${profile}/posts/${currentPost}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const d = await res.json();
      console.log({ res, d });
      if (res) {
        setLoading(false);
        setIsUpdatePost(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function deletePost() {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_PROD_URL
        }/users/${profile}/posts/${currentPost}`,
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
        setIsUpdatePost(false);
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
  function getUserProfileUrl(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.profileUrl;
  }
  function goToPost(userId, postId) {
    navigation(`/home/${userId}/posts/${postId}`);
  }
  function goToProfile(id) {
    navigation(`/home/${id}`);
  }
  async function goToMessage() {
    parseJwt(token);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": 0,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      navigation(`/home/inbox/${data.id}`);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }
  async function follow() {
    parseJwt(token);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}/following`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": 0,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }
  async function unfollow() {
    parseJwt(token);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${profile}/unfollow`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": 0,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
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
    <div className="Profile">
      {isUpdate && (
        <div className="Modal">
          <div className="update-form">
            <div className="update-nav">
              <div className="form-close" onClick={closeForm}>
                <CgClose />
              </div>
              <div style={{ color: "white", fontSize: "20px" }}>
                Edit Profile
              </div>
              <button className="save-btn" onClick={updateProfile}>
                Save
              </button>
            </div>
            <div className="update-inputs">
              <label htmlFor="cover">Cover Image</label>
              <div className="file-input">
                <label htmlFor="cover">
                  <FaImage className="icon" />
                </label>

                <input
                  type="file"
                  name="cover"
                  id="cover"
                  onChange={handleCoverPicUpload}
                />
              </div>
              <label htmlFor="profilePic">Profile Pic</label>
              <div className="file-input">
                <label htmlFor="profilePic">
                  <FaImage className="icon" />
                </label>

                <input
                  type="file"
                  name="profilePic"
                  id="profilePic"
                  onChange={handleProfilePicUpload}
                />
              </div>
              <label htmlFor="username">Username</label>

              <input
                type="text"
                name="username"
                id="username"
                onChange={handleInputChange}
                value={updatedUser.username}
              />
              <br />
            </div>
          </div>
        </div>
      )}
      {isUpdatePost && (
        <div className="Modal">
          <div className="update-form">
            <div className="update-nav">
              <div
                className="form-close"
                onClick={() => setIsUpdatePost(false)}
              >
                <CgClose />
              </div>
              <div style={{ color: "white", fontSize: "20px" }}>Edit Post</div>
              <button className="save-btn" onClick={updatePost}>
                Save
              </button>
            </div>
            <div className="textArea">
              <textarea
                name="text"
                placeholder="What's on your mind?"
                onChange={handleTextChange}
                value={updatedPost.text}
              ></textarea>
            </div>
            <div className="edit-post-image">
              <div className="file-input">
                <label htmlFor="post-image">
                  <FaImage className="icon" />
                </label>

                <input
                  type="file"
                  name="post-image"
                  id="post-image"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>
            <br />
          </div>
        </div>
      )}
      <div className="banner">
        {(user.coverUrl !== "" || user.coverUrl !== null) && (
          <img src={user.coverUrl} />
        )}
        <div className="profile-nav">
          <button onClick={goBack}>
            <IoArrowBackOutline className="icon" />
          </button>
        </div>
        <div className="profile-pic">
          {user.profileUrl === null || user.profileUrl === "" ? (
            <img src="/images/blank-profile-picture-973460_1280.png" />
          ) : (
            <img src={user.profileUrl} />
          )}
        </div>
      </div>
      <div className="edit-profile">
        {profile != userId && (
          <button className="msg-btn" onClick={goToMessage}>
            <FaRegEnvelope color="#e6e8e6" size="2.2rem" className="icon" />
          </button>
        )}
        {profile != userId ? (
          <button
            onClick={() =>
              user.following
                .map((x) => x.followedById)
                .indexOf(Number(userId)) !== -1
                ? unfollow()
                : follow()
            }
            className="edit-btn"
          >
            {user.following &&
            user.following
              .map((x) => x.followedById)
              .indexOf(Number(userId)) !== -1
              ? "Unfollow"
              : "Follow"}
          </button>
        ) : (
          <button onClick={() => setIsUpdate(true)} className="edit-btn">
            Edit Profile
          </button>
        )}
      </div>
      <div className="profile-info">
        <div className="username">{user.username}</div>
        <div>@{user.username}</div>
        <div>
          {"Joined "}
          {user && user.joined && new Date(user.joined).toDateString()}
        </div>
        <div className="follows">
          <div>
            {user && user.followedBy && user.followedBy.length}
            {" Following"}
          </div>
          <div>
            {user && user.following && user.following.length}
            {" Followers"}
          </div>
        </div>
      </div>
      <div className="profile-tabs">
        <div
          className={currentTab === "Posts" ? "tab currentTab" : "tab"}
          onClick={() => setCurrentTab("Posts")}
        >
          <div className="title">Posts</div>
        </div>
        <div
          className={currentTab === "Likes" ? "tab currentTab" : "tab"}
          onClick={() => setCurrentTab("Likes")}
        >
          <div>Likes</div>
        </div>
      </div>
      <div className="posts-likes">
        {currentTab === "Posts" ? (
          <div className="posts">
            {posts.length > 0 ? (
              posts.map((post, i) => (
                <div className="post-card" key={i}>
                  <div className="card-pic-cont">
                    <div
                      className="card-pic
                    "
                    >
                      {user.profileUrl === null || user.profileUrl === "" ? (
                        <img src="/images/blank-profile-picture-973460_1280.png" />
                      ) : (
                        <img src={user.profileUrl} />
                      )}
                    </div>
                  </div>
                  <div className="card-details">
                    <div
                      className="username-options"
                      onClick={() => goToProfile(post.authorId)}
                    >
                      {isOptions && currentPost === post.id && (
                        <div className="options-modal">
                          <div
                            className="option"
                            onClick={() => {
                              setIsUpdatePost(true);
                              setIsOptions(false);
                            }}
                          >
                            <MdOutlineEdit color="#e6e8e6" />
                            <div>Edit</div>
                          </div>
                          <div
                            className="option"
                            onClick={() => {
                              deletePost();
                              setIsOptions(false);
                            }}
                          >
                            <MdDeleteOutline color="#e6e8e6" />
                            <div>Delete</div>
                          </div>
                        </div>
                      )}
                      <div className="card-username">@{user.username}</div>
                      <button
                        onClick={() => {
                          setCurrentPost(post.id);
                          setIsOptions(!isOptions);
                          setUpdatedPost((prev) => ({
                            ...prev,
                            text: post.text,
                          }));
                        }}
                      >
                        <SlOptions color="grey" />
                      </button>
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
                        <div style={{ color: "grey" }}>
                          {post.comments.length}
                        </div>
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

                            <div style={{ color: "grey" }}>
                              {post.likes.length}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="post-likes"
                            onClick={() => likePost(post.authorId, post.id)}
                          >
                            <FaRegHeart color="grey" className="icon" />

                            <div style={{ color: "grey" }}>
                              {post.likes.length}
                            </div>
                          </div>
                        )
                      ) : (
                        <div
                          className="post-likes"
                          onClick={() => likePost(post.authorId, post.id)}
                        >
                          <FaRegHeart key={i} color="grey" className="icon" />
                          <div style={{ color: "grey" }}>
                            {post.likes.length}
                          </div>
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
        ) : (
          <div className="liked">
            {likedPosts.length > 0 ? (
              likedPosts.map((post, i) => (
                <div className="post-card" key={i}>
                  <div className="card-pic-cont">
                    <div
                      className="card-pic
                        "
                    >
                      {getUserProfileUrl(post.post.authorId) === null ||
                      getUserProfileUrl(post.post.authorId) === "" ? (
                        <img src="/images/blank-profile-picture-973460_1280.png" />
                      ) : (
                        <img src={getUserProfileUrl(post.post.authorId)} />
                      )}
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="username-options">
                      <div
                        className="card-username"
                        onClick={() => goToProfile(post.post.authorId)}
                      >
                        @{getUsername(post.post.authorId)}
                      </div>
                    </div>
                    <div
                      className="card-post"
                      onClick={() => goToPost(post.post.authorId, post.post.id)}
                    >
                      <div className="card-text">
                        {typeof post !== "undefined" && post.post.text}
                      </div>
                      {typeof post !== "undefined" &&
                        typeof post.post.imageUrl !== "undefined" &&
                        post.post.imageUrl !== null &&
                        post.post.imageUrl !== "" && (
                          <div className="card-image">
                            <img src={post.post.imageUrl} />
                          </div>
                        )}
                    </div>
                    <div className="comments-likes">
                      <div className="post-comments">
                        <FaRegComment color="grey" className="icon" />
                        <div style={{ color: "grey" }}>
                          {post.post.comments.length}
                        </div>
                      </div>

                      {post.post.likes.length > 0 ? (
                        post.post.likes
                          .map((x) => x.likedById)
                          .indexOf(Number(userId)) !== -1 ? (
                          <div
                            className="post-likes"
                            onClick={() =>
                              unlikePost(
                                post.post.authorId,
                                post.post.id,
                                post.post.likes[
                                  post.post.likes
                                    .map((x) => x.likedById)
                                    .indexOf(Number(userId))
                                ]
                              )
                            }
                          >
                            <IoIosHeart color="red" className="icon" />

                            <div style={{ color: "grey" }}>
                              {post.post.likes.length}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="post-likes"
                            onClick={() =>
                              likePost(post.post.authorId, post.post.id)
                            }
                          >
                            <FaRegHeart color="grey" className="icon" />

                            <div style={{ color: "grey" }}>
                              {post.post.likes.length}
                            </div>
                          </div>
                        )
                      ) : (
                        <div
                          className="post-likes"
                          onClick={() =>
                            likePost(post.post.authorId, post.post.id)
                          }
                        >
                          <FaRegHeart key={i} color="grey" className="icon" />
                          <div style={{ color: "grey" }}>
                            {post.post.likes.length}
                          </div>
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
                No likes.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default Profile;
