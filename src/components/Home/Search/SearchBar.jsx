import { useState, useEffect } from "react";

function SearchBar({ search }) {
  const [term, setTerm] = useState("");
  useEffect(() => {
    if (term === "") {
      search("");
    }
  }, [term]);
  return (
    <div className="SearchBar">
      <input type="search" onChange={(e) => setTerm(e.target.value)} />
      <button onClick={() => search(term)}>Search</button>
    </div>
  );
}

export default SearchBar;
