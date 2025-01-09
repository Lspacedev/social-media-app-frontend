import { useState } from "react";
import { useNavigate } from "react-router";
import { CgClose } from "react-icons/cg";

function Signin({ closeForm }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const navigation = useNavigate();

  async function signIn(e) {
    setLoading(true);
    e.preventDefault();
    let userData = { username: username, password: password };

    try {
      const res = await fetch("http://localhost:3000/log-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      setLoading(false);
      console.log({ data });
      if (typeof data.errors !== "undefined") {
        setErrors(data.errors);
      } else {
        alert(data.message);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        navigation("/home");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="Signin">
      {!loading ? (
        <>
          <div className="form-close" onClick={closeForm}>
            <CgClose />
          </div>
          <div style={logo}>R</div>

          <div className="signin-form-div">
            <h3>Sign in to R</h3>
            <div id="errors">
              {errors &&
                errors.map((error, i) => (
                  <span key={i} className="error">
                    {error}
                  </span>
                ))}
            </div>
            <input
              type="username"
              id="username"
              name="username"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button onClick={signIn}>Submit</button>
          </div>
        </>
      ) : (
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
      )}
    </div>
  );
}

export default Signin;
const logo = {
  fontSize: "5rem",
  fontWeight: "400",
  fontStyle: "normal",
  fontFamily: "Silkscreen, serif",
  WebkitTextStroke: "3px #E6E8E6",
  textAlign: "center",
};
