export const API_ENDPOINTS = {
  AMENITY: "/Amenity",
  ROOM: "/Room",
  BOOKING: "/Booking",
  CUSTOMER: "/Customer",
  AUTH: "/Auth",
} as const

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_PAGE_INDEX = 1

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
