import { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import io from "socket.io-client";

function Notifications() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  const userId = localStorage.getItem("userId");

  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      await getUser();
      setLoading(false);
    })();
  }, []);
  useEffect(() => {
    const socket = io.connect(`${import.meta.env.VITE_PROD_URL}`);
    const handleUpdateUser = (user) => {
      console.log({ user });
      setUser(user);
    };
    socket.on("notifications-updated", handleUpdateUser);
    return () => {
      socket.off("notifications-updated", handleUpdateUser);
    };
  }, []);

  async function getUser() {
    try {
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
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteNotfication(id) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
  function formateTimestamp(date) {
    const d = new Date(date).toDateString();
    return d;
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
    <div className="Notifications">
      {user.notifications && user?.notifications.length > 0 ? (
        user.notifications.map((notification, i) => (
          <div className="notification-card" key={i}>
            <div className="notification-card-details">
              <div>{notification.message}</div>
              <div>{formateTimestamp(notification.timestamp)}</div>
            </div>
            <div
              className="notification-card-delete"
              onClick={() => deleteNotfication(notification.id)}
            >
              <CgClose />
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            color: "#e6e8e6",
            textAlign: "center",
            margin: "100px 0px",
          }}
        >
          No notifications
        </div>
      )}
    </div>
  );
}

export default Notifications;
