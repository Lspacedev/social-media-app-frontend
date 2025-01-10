import { useState } from "react";
import { useParams } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import parseJwt from "../../utils/checkToken";

function SendMessage() {
  const [text, setText] = useState("");
  const { uid } = useParams();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  async function sendReply() {
    parseJwt(token);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PROD_URL}/users/${userId}/messages/${uid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();

      //setLoading(false);
    } catch (err) {
      console.log(err);
      //setErr(err.message)
    }
  }
  return (
    <div className="SendMessage">
      <input
        type="text"
        maxLength="150"
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={sendReply}>
        <IoMdSend size="2rem" color="#e6e8e6" />
      </button>
    </div>
  );
}

export default SendMessage;
