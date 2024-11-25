import { Input } from "antd";
import PropTypes from "prop-types";

const SearchBar = ({ onSearch }) => {
  return (
    <div>
      <Input.Search
        style={{ marginBottom: "20px", padding: "8px" }}
        placeholder="Search by Supplier or Product Name..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;

import { Input } from "antd";
import PropTypes from "prop-types";

const SearchBar = ({ onSearch }) => {
  return (
    <div>
      <Input.Search
        style={{ marginBottom: "20px", padding: "8px" }}
        placeholder="Search by Supplier or Product Name..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;