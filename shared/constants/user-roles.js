const USER_ROLES = {
  ADMIN: 'admin',
  CREATOR: 'creator',
  VIEWER: 'viewer'
};

const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.CREATOR]: 2,
  [USER_ROLES.VIEWER]: 1
};

module.exports = {
  USER_ROLES,
  ROLE_HIERARCHY
};
