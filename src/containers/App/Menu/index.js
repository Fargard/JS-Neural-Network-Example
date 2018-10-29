import React from "react";

import Link from "./Link";

const Menu = ({ links }) => (
  <ul className="header">
    <Link links={links} />
  </ul>
);

export default Menu;
