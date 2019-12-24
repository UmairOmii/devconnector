import { combineReducers } from 'redux';
import authReducer from './authReducer'
import errorRreducer from './errorReducer'
import profileReducer from './profileReducer'
import postReducer from './postReducer';

export default combineReducers({
    auth: authReducer,
    errors: errorRreducer,
    profile: profileReducer,
    post: postReducer
})