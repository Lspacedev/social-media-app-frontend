const parseJwt = async (token) => {
  const decode = JSON.parse(atob(token.split(".")[1]));

  if (decode.exp * 1000 < new Date().getTime()) {
    localStorage.clear("token");
    return;
  }
};

export default parseJwt;
