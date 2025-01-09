import { useState } from "react";
import { FaImage } from "react-icons/fa6";
function CreatePost() {
  const [text, setText] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  async function create() {
    if (text === "" && typeof image === "undefined") {
      alert("Nothing to post");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    if (text !== "") {
      formData.append("text", text);
    }

    if (typeof image !== "undefined") {
      formData.append("image", image);
    }
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div
      className="CreatePost"
      style={{
        height: "150px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <div
          style={{
            flex: 1,
            height: "100%",
            color: "#e6e8e6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Loading...
        </div>
      ) : (
        <>
          <div className="textArea">
            <textarea
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.target.value)}
              maxLength="700"
            ></textarea>
          </div>

          <div className="post-content">
            <div>
              <label htmlFor="image">
                <FaImage className="icon" />
              </label>

              <input
                type="file"
                name="image"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <button onClick={create}>Post</button>
          </div>
        </>
      )}
    </div>
  );
}

export default CreatePost;
