import axios from 'axios';
import { GET_ERRORS, SET_CURRENT_USER } from './types'
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken'

// Register User
export const registerUser =  (userData, history) => dispatch => {
    axios
    .post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err => 
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
        );
}

// Login-Get User Token
export const loginUser = userData => dispatch => {
    axios
     .post('/api/users/login', userData)
     .then(res => {
        // Save to localStorage
        const { token } = res.data;
        // Set to ls
        localStorage.setItem('jwtToken', token);
        // Set Token to Auth Header
        setAuthToken(token)
        // Decode Token to get User data
        const decoded = jwt_decode(token);
        // set current user
        dispatch(setCurrentUser(decoded));

     })
     .catch(err => 
        dispatch({
            type:GET_ERRORS,
            payload: err.response.data
        })
        )
}

// set logged in user
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}

// Log user out 
export const logoutUser = () => dispatch => {
    // Remoove Token from localStorage
    localStorage.removeItem('jwtToken');
      // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
}