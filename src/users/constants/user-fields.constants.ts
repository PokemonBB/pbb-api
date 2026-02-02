export const USER_FIELD_SELECTORS = {
  ADMIN: '-password',
  USER: '-password -active -email -canInvite -__v -createdAt -updatedAt',
} as const;

export const USER_FILTERS = {
  ACTIVE_ONLY: { active: true },
  ALL_USERS: {},
} as const;

export const PRIVATE_FIELDS = {
  PASSWORD: 'password',
  EMAIL: 'email',
  INTERNAL_FIELDS: '__v',
  TIMESTAMPS: 'createdAt updatedAt',
} as const;

export const USER_VISIBILITY = {
  ADMIN: {
    canSeeEmails: true,
    canSeeTimestamps: true,
    canSeeInternalFields: true,
  },
  USER: {
    canSeeEmails: false,
    canSeeTimestamps: false,
    canSeeInternalFields: false,
  },
} as const;
