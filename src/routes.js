import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

//import views
import {
  AppView,
  Home,
  NotFound,
  Theory,
  ExampleWithTeacher
} from "./containers/";

export const links = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/theory",
    name: "Theory",
    component: Theory
  },
  {
    path: "/exaple-with-teacher",
    name: "Example-with-teacher",
    component: ExampleWithTeacher
  }
];

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <AppView>
        <Switch>
          {links.map((link, index) => (
            <Route
              key={index}
              exact
              path={link.path}
              component={link.component}
            />
          ))}
          <Route component={NotFound} />
        </Switch>
      </AppView>
      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>
);

export default Routes;
