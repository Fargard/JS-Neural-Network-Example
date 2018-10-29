import React from "react";

import { links } from "../../routes";

import Menu from "./Menu";

const AppVeiw = ({ children }) => (
  <div>
    <h1>JS Neural Network</h1>
    <Menu links={links} />
    <div className="content">{children}</div>
  </div>
);

export default AppVeiw;
