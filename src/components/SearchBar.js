import React from 'react';
import { FaSearch, FaMicrophone } from 'react-icons/fa';

function SearchBar({ value, onChange, onSearch }) {
  return (
    <form className="search-bar-container" onSubmit={onSearch}>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="search-input"
          autoFocus
        />
        <FaMicrophone className="mic-icon" />
      </div>
    </form>
  );
}

export default SearchBar;