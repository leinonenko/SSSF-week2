import {Document} from 'mongoose';

// TODO: user interface
interface User extends Document {
  user_name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface UserOutput {
  _id: string;
  user_name: string;
  email: string;
}
interface LoginUser {
  user_name: string;
  password: string;
}

export {User, UserOutput, LoginUser};
