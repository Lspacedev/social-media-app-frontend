import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SearchBar from "./SearchBar";
import parseJwt from "../../../utils/checkToken";
import io from "socket.io-client";

function Search() {
  const navigation = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAll, setSearchAll] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("Followers");
  const [targetUserId, setTargetUserId] = useState("");

  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      await getUsers();
      await getFollowers();
      await getFollowing();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0 && users.length > 0) {
      if (searchAll) {
        let filteredUsers = users.filter((user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredUsers.length > 0) {
          setSearchResults(filteredUsers);
        }
      } else {
        if (currentTab === "Followers" && followers.length > 0) {
          let filteredUsers = followers.filter((user) =>
            user.followedBy.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
          if (filteredUsers.length > 0) {
            setSearchResults(filteredUsers);
          }
        } else if (currentTab === "Following" && following.length > 0) {
          let filteredUsers = following.filter((user) =>
            user.following.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
          if (filteredUsers.length > 0) {
            setSearchResults(filteredUsers);
          }
        }
      }
    }
    return () => setSearchResults([]);
  }, [searchTerm, searchAll]);
  useEffect(() => {
    console.log({ targetUserId }, Number(userId) !== targetUserId);
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`);
    const loggedProfileUpdate = (userFollowers) => {
      if (Number(userId) !== targetUserId) {
      }
    };
    socket.on("followers-updated", (userFollowers) => {
      if (Number(userId) === userFollowers.id) {
        setFollowers(userFollowers.followers);
      }
    });
    socket.on("following-updated", (userFollowing) => {
      if (Number(userId) === userFollowing.id) {
        setFollowing(userFollowing.following);
      }
    });
  }, [targetUserId]);
  function search(term) {
    setSearchTerm(term);
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
        //navigation(0);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function getFollowers() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/followers`,
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
        setFollowers(data.followers);
        //navigation(0);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function getFollowing() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/following`,
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
        setFollowing(data.following);
        //navigation(0);
      }
    } catch (err) {
      console.log(err);
    }
  }
  function getUsername(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.username;
  }
  function goToProfile(id) {
    navigation(`/home/${id}`);
  }
  async function unfollow(id) {
    parseJwt(token);
    setTargetUserId(id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${id}/unfollow`,
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
      //setErr(err.message)
    }
  }
  async function follow(id) {
    parseJwt(token);
    setTargetUserId(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${id}/following`,
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
      console.log(res, data);

      setLoading(false);
    } catch (err) {
      console.log(err);
      //setErr(err.message)
    }
  }
  function getUserProfileUrl(id) {
    const [user] = users.filter((user) => user.id === id);
    return user.profileUrl;
  }
  if (loading) return <div className="search-loading">Loading...</div>;
  return (
    <div className="Search">
      <div className="SearchBar">
        <input
          type="search"
          placeholder="Find accounts"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      <div className="search-options">
        <input
          type="checkbox"
          id="all"
          name="all"
          value="all"
          onChange={(e) => {
            setSearchAll(e.target.checked);
            setSearchResults([]);
            setSearchTerm("");
          }}
        />
        <p style={{ color: "#e6e8e6" }}>All Users</p>
      </div>
      {searchAll && (
        <div className="all-user-results">
          {searchResults.length !== 0 && searchAll ? (
            searchResults.map((follower, i) => (
              <div className="account-card" key={i}>
                <div className="card-pic-cont">
                  <div
                    className="card-pic
                    "
                  >
                    {getUserProfileUrl(follower.id) === null ||
                    getUserProfileUrl(follower.id) === "" ? (
                      <img src="/images/blank-profile-picture-973460_1280.png" />
                    ) : (
                      <img src={getUserProfileUrl(follower.id)} />
                    )}
                  </div>
                </div>
                <div className="card-details">
                  <div
                    className="username-options"
                    onClick={() => goToProfile(follower.id)}
                  >
                    <div className="username">{getUsername(follower.id)}</div>
                    <div className="card-username">
                      @{getUsername(follower.id)}
                    </div>
                  </div>
                  {follower.id != userId && (
                    <button
                      className="unfollow-btn"
                      onClick={() =>
                        following
                          .map((x) => x.followingId)
                          .indexOf(Number(follower.id)) !== -1
                          ? unfollow(follower.id)
                          : follow(follower.id)
                      }
                    >
                      {following
                        .map((x) => x.followingId)
                        .indexOf(Number(follower.id)) !== -1
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : searchResults.length === 0 &&
            searchAll &&
            searchTerm.length > 0 ? (
            <div
              style={{
                color: "#e6e8e6",
                textAlign: "center",
                margin: "10px",
              }}
            >
              No users found
            </div>
          ) : (
            <div
              style={{
                color: "#e6e8e6",
                textAlign: "center",
                margin: "10px",
              }}
            >
              Discover new accounts
            </div>
          )}
        </div>
      )}
      <div className="tabs">
        <div
          className={currentTab === "Followers" ? "tab current-tab" : "tab"}
          onClick={() => {
            setCurrentTab("Followers");
            setSearchResults([]);
            setSearchTerm("");
          }}
        >
          Followers
        </div>
        <div
          className={currentTab === "Following" ? "tab current-tab" : "tab"}
          onClick={() => {
            setCurrentTab("Following");
            setSearchResults([]);
            setSearchTerm("");
          }}
        >
          Following
        </div>
      </div>
      <div className="follows">
        {currentTab === "Followers" ? (
          searchResults.length !== 0 && !searchAll ? (
            searchResults.map((follower, i) => (
              <div className="account-card" key={i}>
                <div className="card-pic-cont">
                  <div
                    className="card-pic
                    "
                  >
                    {getUserProfileUrl(follower.followedBy.id) === null ||
                    getUserProfileUrl(follower.followedBy.id) === "" ? (
                      <img src="/images/blank-profile-picture-973460_1280.png" />
                    ) : (
                      <img src={getUserProfileUrl(follower.followedBy.id)} />
                    )}
                  </div>
                </div>
                <div className="card-details">
                  <div
                    className="username-options"
                    onClick={() => goToProfile(follower.followedBy.id)}
                  >
                    <div className="username">
                      {getUsername(follower.followedBy.id)}
                    </div>
                    <div className="card-username">
                      @{getUsername(follower.followedBy.id)}
                    </div>
                  </div>
                  <button
                    className="unfollow-btn"
                    onClick={() =>
                      following
                        .map((x) => x.followingId)
                        .indexOf(Number(follower.followedBy.id)) !== -1
                        ? unfollow(follower.followedBy.id)
                        : follow(follower.followedBy.id)
                    }
                  >
                    {following
                      .map((x) => x.followingId)
                      .indexOf(Number(follower.followedBy.id)) !== -1
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                </div>
              </div>
            ))
          ) : followers.length > 0 ? (
            followers.map((follower, i) => (
              <div className="account-card" key={i}>
                <div className="card-pic-cont">
                  <div
                    className="card-pic
                        "
                  >
                    {getUserProfileUrl(follower.followedById) === null ||
                    getUserProfileUrl(follower.followedById) === "" ? (
                      <img src="/images/blank-profile-picture-973460_1280.png" />
                    ) : (
                      <img src={getUserProfileUrl(follower.followedById)} />
                    )}
                  </div>
                </div>
                <div className="card-details">
                  <div
                    className="username-options"
                    onClick={() => goToProfile(follower.followedById)}
                  >
                    <div className="username">
                      {getUsername(follower.followedById)}
                    </div>
                    <div className="card-username">
                      @{getUsername(follower.followedById)}
                    </div>
                  </div>
                  <button
                    className="unfollow-btn"
                    onClick={() =>
                      following
                        .map((x) => x.followingId)
                        .indexOf(Number(follower.followedById)) !== -1
                        ? unfollow(follower.followedById)
                        : follow(follower.followedById)
                    }
                  >
                    {following
                      .map((x) => x.followingId)
                      .indexOf(Number(follower.followedById)) !== -1
                      ? "Unfollow"
                      : "Follow"}
                  </button>
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
              No followers
            </div>
          )
        ) : searchResults.length !== 0 && !searchAll ? (
          searchResults.map((following, i) => (
            <div className="account-card" key={i}>
              <div className="card-pic-cont">
                <div
                  className="card-pic
                  "
                >
                  {getUserProfileUrl(following.following.id) === null ||
                  getUserProfileUrl(following.following.id) === "" ? (
                    <img src="/images/blank-profile-picture-973460_1280.png" />
                  ) : (
                    <img src={getUserProfileUrl(following.following.id)} />
                  )}
                </div>
              </div>
              <div className="card-details">
                <div
                  className="username-options"
                  onClick={() => goToProfile(following.following.id)}
                >
                  <div className="username">
                    {getUsername(following.following.id)}
                  </div>
                  <div className="card-username">
                    @{getUsername(following.following.id)}
                  </div>
                </div>
                <button
                  className="unfollow-btn"
                  onClick={() => unfollow(following.following.id)}
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))
        ) : following.length > 0 ? (
          following.map((following, i) => (
            <div className="account-card" key={i}>
              <div className="card-pic-cont">
                <div
                  className="card-pic
                    "
                >
                  {getUserProfileUrl(following.followingId) === null ||
                  getUserProfileUrl(following.followingId) === "" ? (
                    <img src="/images/blank-profile-picture-973460_1280.png" />
                  ) : (
                    <img src={getUserProfileUrl(following.followingId)} />
                  )}
                </div>
              </div>
              <div className="card-details">
                <div
                  className="username-options"
                  onClick={() => goToProfile(following.followingId)}
                >
                  <div className="username">
                    {getUsername(following.followingId)}
                  </div>
                  <div className="card-username">
                    @{getUsername(following.followingId)}
                  </div>
                </div>
                <button
                  className="unfollow-btn"
                  onClick={() => unfollow(following.followingId)}
                >
                  Unfollow
                </button>
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
            You currently are not following any accounts
          </div>
        )}
      </div>
    </div>
  );
}
export default Search;
