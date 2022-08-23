import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Seller from './pages/Seller/Seller';
import NotFound from './pages/NotFound/NotFound';
import Product from './pages/Product/Product';
import CreateProduct from './pages/CreateProduct/CreateProduct';
import UpdateProduct from './pages/UpdateProduct/UpdateProduct';
import RegisterSeller from './pages/RegisterSeller/RegisterSeller';
import Dashboard from './pages/Dashboard/Dashboard';
import { openNotificationWithIcon } from './components/Notification/Notification';

import Loader from './components/Loader/Loader';

import { logInUserWithOauth, loadMe } from './store/actions/authActions';

const App = ({ logInUserWithOauth, auth, loadMe }) => {
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (auth.error) {
      openNotificationWithIcon({
        type: 'error',
        message: auth.error,
      });
    }
  }, [auth.error]);

  useEffect(() => {
    if (window.location.hash === '#_=_') window.location.hash = '';

    const cookieJwt = Cookies.get('x-auth-cookie');
    if (cookieJwt) {
      Cookies.remove('x-auth-cookie');
      logInUserWithOauth(cookieJwt);
    }
  }, []);

  useEffect(() => {
    if (!auth.appLoaded && !auth.isLoading && auth.token && !auth.isAuthenticated) {
      loadMe();
    }
  }, [auth.isAuthenticated, auth.token, loadMe, auth.isLoading, auth.appLoaded]);

  return (
    <>
      {auth.appLoaded ? (
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/notfound" component={NotFound} />
          <Route path="/seller/product/add-new" component={CreateProduct} />
          <Route path="/register-seller" component={RegisterSeller} />
          <Route path="/store/:id" component={Seller} />
          <Route path="/seller-product/:id" component={UpdateProduct} />
          <Route path="/seller-dashboard" component={Dashboard} />
          <Route path="/product/:id" component={Product} />
          <Route exact path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      ) : (
        <Loader />
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default compose(connect(mapStateToProps, { logInUserWithOauth, loadMe }))(App);
