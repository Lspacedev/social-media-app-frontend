import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MdHomeFilled } from "react-icons/md";
import { MdPermIdentity } from "react-icons/md";
import { MdOutlineInbox } from "react-icons/md";
import { MdNotifications } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { CgClose } from "react-icons/cg";

import io from "socket.io-client";

function SideNavigation() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const navigation = useNavigate();

  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");

  useEffect(() => {
    getUser();
    // setLoading(false);
  }, []);
  useEffect(() => {
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`);
    socket.on("notifications-updated", (user) => {
      if (user.id === Number(userId)) {
        setUser(user);
      }
    });
  }, []);

  async function getUser() {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}`,
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
        setLoading(false);

        //navigation(0);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
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

  if (loading) return <div className="side-loading">Loading...</div>;
  function handleHamBurgerMenu() {
    const sidebar = document.querySelector(".SideNavigation");
    sidebar.classList.toggle("active");
  }
  return (
    <div className="SideNavigation">
      <div className="side-close" onClick={handleHamBurgerMenu}>
        <CgClose />
      </div>
      <div className="sideNavLink" onClick={goToHome}>
        <MdHomeFilled color="#e6e8e6" size="2.5rem" className="icon" />
        <div>Home</div>
      </div>
      <div className="sideNavLink" onClick={goToNotifications}>
        <div className="notifs">
          <MdNotifications color="#e6e8e6" size="2.5rem" className="icon" />
          <span className="notifs-count">
            {user &&
              user.notifications &&
              user.notifications.length > 0 &&
              user.notifications.length}
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
