import * as authSchema from '../auth/schema';
import * as postSchema from '../post/schema';
import * as notificationSchema from '../notifications/schema';
import * as communitySchema from '../community/schema';
import * as commentSchema from '../comment/schema';
import * as userSchema from '../user/schema';
import * as messageSchema from '../message/schema';
import * as relations from './relations';

export const schema = {
  ...authSchema,
  ...postSchema,
  ...notificationSchema,
  ...communitySchema,
  ...commentSchema,
  ...userSchema,
  ...messageSchema,
  ...relations,
};
export type Schema = typeof schema;
