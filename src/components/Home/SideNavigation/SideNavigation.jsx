import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MdHomeFilled } from "react-icons/md";
import { MdPermIdentity } from "react-icons/md";
import { MdOutlineInbox } from "react-icons/md";
import { MdNotifications } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import io from "socket.io-client";

function SideNavigation() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const navigation = useNavigate();

  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      await getUser();
      setLoading(false);
    })();
  }, []);
  useEffect(() => {
    const socket = io.connect("http://localhost:3000");
    socket.on("notifications-updated", (user) => {
      if (user.id === Number(userId)) {
        setUser(user);
      }
    });
  }, []);

  async function getUser() {
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        //navigation(0);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function goToHome() {
    navigation("/home");
  }
  function goToProfile() {
    navigation(`/home/${userId}`);
  }
  function goToInbox() {
    navigation(`/home/inbox`);
  }
  function goToSearch() {
    navigation(`/home/search`);
  }
  function goToNotifications() {
    navigation(`/home/notifications`);
  }
  function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigation("/");
  }

  if (loading)
    return (
      <div
        style={{
          color: "#e6e8e6",
          flex: 1,
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
    <div className="SideNavigation">
      <div className="sideNavLink" onClick={goToHome}>
        <MdHomeFilled color="#e6e8e6" size="2.5rem" className="icon" />
        <div>Home</div>
      </div>
      <div className="sideNavLink" onClick={goToNotifications}>
        <div className="notifs">
          <MdNotifications color="#e6e8e6" size="2.5rem" className="icon" />
          <span className="notifs-count">
            {user && user.notifications.length > 0 && user.notifications.length}
          </span>
        </div>
        <div className="notifs">Notifications</div>
      </div>
      <div className="sideNavLink" onClick={goToProfile}>
        <MdPermIdentity color="#e6e8e6" size="2.5rem" className="icon" />
        <div>Profile</div>
      </div>
      <div className="sideNavLink" onClick={goToSearch}>
        <IoSearch color="#e6e8e6" size="2.5rem" className="icon" />
        <div>Discover</div>
      </div>
      <div className="sideNavLink" onClick={goToInbox}>
        <MdOutlineInbox color="#e6e8e6" size="2.5rem" className="icon" />
        <div>Inbox</div>
      </div>
      <div className="sideNavLink logout" onClick={logout}>
        <MdPermIdentity color="#e6e8e6" size="2.5rem" className="icon" />
        <div>Logout</div>
      </div>
    </div>
  );
}

export default SideNavigation;
