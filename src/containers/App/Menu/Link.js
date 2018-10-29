import React from "react";
import { NavLink } from "react-router-dom";

const Link = ({ links }) => (
  <li>
    {links.map((link, index) => (
      <NavLink key={index} exact to={link.path}>
        {link.name}
      </NavLink>
    ))}
  </li>
);

export default Link;
