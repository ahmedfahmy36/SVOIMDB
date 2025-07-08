import React from "react";

const search = (props) => {
  return (
    <div className="search">
      <div>
        <img src="img/search.svg" alt="search icon" />
        <input
          type="text"
          placeholder="Search for a thousand of movies"
          value={props.searchTerm}
          onChange={(e) => props.setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default search;
