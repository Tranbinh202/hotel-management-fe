# Hướng dẫn sử dụng API với Axios và React Query

## Cấu hình

### 1. Environment Variables

Tạo file `.env.local` trong thư mục root:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
\`\`\`

### 2. Cấu trúc thư mục

\`\`\`
lib/
├── axios.ts                 # Axios instance với interceptors
├── react-query-provider.tsx # React Query provider
├── api/
│   ├── amenities.ts        # API functions cho amenities
│   └── auth.ts             # API functions cho authentication
└── hooks/
    ├── use-amenities.ts    # React Query hooks cho amenities
    └── use-auth.ts         # React Query hooks cho auth
\`\`\`

## Sử dụng trong Components

### Ví dụ 1: Lấy danh sách tiện nghi

\`\`\`tsx
'use client'

import { useAmenities } from '@/lib/hooks/use-amenities'

export default function AmenitiesList() {
  const { data: amenities, isLoading, error } = useAmenities()

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Có lỗi xảy ra</div>

  return (
    <div>
      {amenities?.map((amenity) => (
        <div key={amenity.amenityId}>
          <h3>{amenity.amenityName}</h3>
          <p>{amenity.description}</p>
        </div>
      ))}
    </div>
  )
}
\`\`\`

### Ví dụ 2: Tạo tiện nghi mới

\`\`\`tsx
'use client'

import { useCreateAmenity } from '@/lib/hooks/use-amenities'
import { useState } from 'react'

export default function CreateAmenityForm() {
  const createAmenity = useCreateAmenity()
  const [formData, setFormData] = useState({
    amenityName: '',
    description: '',
    price: 0,
    isActive: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createAmenity.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.amenityName}
        onChange={(e) => setFormData({ ...formData, amenityName: e.target.value })}
        placeholder="Tên tiện nghi"
      />
      <button type="submit" disabled={createAmenity.isPending}>
        {createAmenity.isPending ? 'Đang tạo...' : 'Tạo tiện nghi'}
      </button>
    </form>
  )
}
\`\`\`

### Ví dụ 3: Đăng nhập

\`\`\`tsx
'use client'

import { useLogin } from '@/lib/hooks/use-auth'
import { useState } from 'react'

export default function LoginForm() {
  const login = useLogin()
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(credentials)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="Mật khẩu"
      />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}
\`\`\`

## Tính năng

### Axios Instance
- Tự động thêm Bearer token vào header
- Xử lý lỗi 401 (redirect về login)
- Xử lý lỗi 403, 500
- Timeout 10 giây

### React Query
- Caching tự động
- Refetch khi cần thiết
- Optimistic updates
- Loading và error states
- DevTools để debug

## Thêm API mới

1. Tạo file trong `lib/api/` với các functions
2. Tạo custom hooks trong `lib/hooks/`
3. Sử dụng hooks trong components

\`\`\`typescript
// lib/api/rooms.ts
export const roomsApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/rooms')
    return response.data
  },
  // ... other methods
}

// lib/hooks/use-rooms.ts
export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
  })
}
\`\`\`
