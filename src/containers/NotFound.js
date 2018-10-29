import React from "react";

const NotFound = ({ location }) => (
  <div>
    <h2>Whoops!</h2>
    <h3>
      Looks like there is no such page here - <code>{location.pathname}</code>
    </h3>
  </div>
);

export default NotFound;
