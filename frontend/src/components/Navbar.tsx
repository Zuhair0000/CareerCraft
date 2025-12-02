import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <div>
        <p>CarrerCraft</p>
      </div>

      <div>
        <Link to="/signup">Sign up</Link>
      </div>
    </nav>
  );
}

export default Navbar;
