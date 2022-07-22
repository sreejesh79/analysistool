import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';
import App from '../app';
import Login from '../components/pages/login';
import Dashboard from "../components/pages/dashboard";
import Gallery from "../components/pages/gallery";
import Image from "../components/pages/gallery/image";
import Video from "../components/pages/gallery/video";
import Verbatim from "../components/pages/gallery/verbatim";
import Permission from "../components/pages/permission";
import Search from '../components/pages/search';

// import 'styles/index.scss'; /* commented index.scss -GM */

const Routes = () => (
  <Router onUpdate={() => window.scrollTo(0, 0)}>
    <div>
      <Route exact path = "/*" component={App}/>
      {/* <Route exact path="/" render={() => <Redirect to="/login" />}/> */}
      <Route exact path = "/login" component={Login}/>
      <Route exact path = "/dashboard/:studyType?" render={(props) => (<Dashboard studyType={props.match.params.studyType} {...props} />)} />
      <Route exact path = "/gallery/:studyId/:type?" render={(props) => (<Gallery studyId={props.match.params.studyId} type={props.match.params.type} search={props.location.search} {...props} />)} />
      <Route exact path = "/search" render={(props) => (<Search search={props.location.search} {...props} />)} />
      <Route exact path = "/permission" component={Permission}/>
      {/* <Route path = "*" component={Login} /> */}
    </div>
  </Router>
);

export default Routes;
