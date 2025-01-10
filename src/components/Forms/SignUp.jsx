import { useState } from "react";
import { useNavigate } from "react-router";
import { CgClose } from "react-icons/cg";
function SignUp({ closeForm }) {
  const [obj, setObj] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const navigation = useNavigate();
  function handleInputChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    setObj((prev) => ({ ...prev, [name]: value }));
  }
  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_PROD_URL}/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      });
      const data = await res.json();
      if (typeof data.errors !== "undefined") {
        setErrors(data.errors);
      } else {
        alert(data.message);
        closeForm();
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className="SignUp">
      {!loading ? (
        <>
          <div className="form-close" onClick={closeForm}>
            <CgClose />
          </div>
          <div style={logo}>R</div>

          <div className="signup-form-div">
            <h3>Create your account</h3>
            <div id="errors">
              {errors &&
                errors.map((error, i) => (
                  <div key={i} className="error">
                    {error.msg}
                  </div>
                ))}
            </div>
            <input
              type="username"
              id="username"
              name="username"
              placeholder="Username"
              onChange={(e) => handleInputChange(e)}
            />
            <br />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              onChange={(e) => handleInputChange(e)}
            />
            <br />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              onChange={(e) => handleInputChange(e)}
            />
            <br />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm password"
              onChange={(e) => handleInputChange(e)}
            />

            <br />
            <button onClick={handleSubmit}>Submit</button>
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

export default SignUp;
const logo = {
  fontSize: "5rem",
  fontWeight: "400",
  fontStyle: "normal",
  fontFamily: "Silkscreen, serif",
  WebkitTextStroke: "3px #E6E8E6",
  textAlign: "center",
};
