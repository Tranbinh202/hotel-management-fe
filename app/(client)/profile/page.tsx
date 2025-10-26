"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useMyAccountSummary, useUpdateAcountProfile } from "@/lib/hooks/use-account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Save,
  X,
  Camera,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  DollarSign,
} from "lucide-react"
import { fileApi } from "@/lib/api/file"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { CustomerProfileDetails } from "@/lib/types/api"

export default function ClientProfilePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: accountSummary, isLoading } = useMyAccountSummary()
  const updateProfile = useUpdateAcountProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    identityCard: "",
    address: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (accountSummary && accountSummary.accountType === "Customer") {
      const profile = accountSummary.profileDetails as CustomerProfileDetails
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        identityCard: profile.identityCard || "",
        address: profile.address || "",
      })
      if (profile.avatarUrl) {
        setAvatarUrl(profile.avatarUrl)
      }
    }
  }, [accountSummary])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB")
      return
    }

    setIsUploadingAvatar(true)
    try {
      const uploadResult = await fileApi.upload(file)
      setAvatarUrl(uploadResult.secureUrl)
      toast.success("Ảnh đại diện đã được tải lên thành công")
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      toast.error("Không thể tải lên ảnh đại diện. Vui lòng thử lại.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên")
      return
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại")
      return
    }

    try {
      await updateProfile.mutateAsync({
        ...formData,
        ...(avatarUrl && { avatarUrl }),
      })
      toast.success("Cập nhật thông tin thành công", { duration: 4000 })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.", { duration: 4000 })
    }
  }

  const handleCancel = () => {
    if (accountSummary && accountSummary.accountType === "Customer") {
      const profile = accountSummary.profileDetails as CustomerProfileDetails
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        identityCard: profile.identityCard || "",
        address: profile.address || "",
      })
      if (profile.avatarUrl) {
        setAvatarUrl(profile.avatarUrl)
      }
    }
    setIsEditing(false)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !accountSummary) {
    return null
  }

  const profile = accountSummary.profileDetails as CustomerProfileDetails
  const displayName = profile.fullName || accountSummary.username
  const displayEmail = accountSummary.email
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container max-w-8xl mx-auto py-8 md:py-12">
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-8 md:p-12 shadow-xl">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Hồ sơ của tôi</h1>
            <p className="text-pink-100 text-lg">Quản lý thông tin cá nhân và tài khoản của bạn</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600" />
              <CardContent className="pt-0 pb-8">
                <div className="flex flex-col items-center -mt-16">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-pink-100">
                      <AvatarImage src={avatarUrl || profile.avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 cursor-pointer group">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg group-hover:scale-110">
                          {isUploadingAvatar ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Camera className="h-5 w-5" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                        />
                      </label>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 text-center">{displayName}</h2>
                  <p className="text-slate-600 mt-1 text-center">{displayEmail}</p>

                  <Badge variant="secondary" className="mt-3">
                    Khách hàng
                  </Badge>

                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      size="lg"
                    >
                      Chỉnh sửa hồ sơ
                    </Button>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500">Tham gia</p>
                      <p className="font-medium text-slate-900">
                        {new Date(accountSummary.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500">Đăng nhập lần cuối</p>
                      <p className="font-medium text-slate-900">
                        {new Date(accountSummary.lastLoginAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {accountSummary.statistics && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Tổng đặt phòng</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {accountSummary.statistics.totalBookings || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Hoàn thành</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {accountSummary.statistics.completedBookings || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Đã hủy</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {accountSummary.statistics.cancelledBookings || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Star className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Đánh giá</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {accountSummary.statistics.totalFeedbacks || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow sm:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Tổng chi tiêu</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {accountSummary.statistics.totalSpent
                            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                accountSummary.statistics.totalSpent,
                              )
                            : "0 ₫"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin liên hệ và địa chỉ của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2 text-slate-700">
                        <User className="h-4 w-4 text-slate-500" />
                        Họ và tên
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="h-11 disabled:opacity-60"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-slate-700">
                        <Phone className="h-4 w-4 text-slate-500" />
                        Số điện thoại
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        disabled={!isEditing}
                        placeholder="0123456789"
                        className="h-11 disabled:opacity-60"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identityCard" className="flex items-center gap-2 text-slate-700">
                        <CreditCard className="h-4 w-4 text-slate-500" />
                        CMND/CCCD
                      </Label>
                      <Input
                        id="identityCard"
                        value={formData.identityCard}
                        onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Số CMND/CCCD"
                        className="h-11 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700">
                        <Mail className="h-4 w-4 text-slate-500" />
                        Email
                      </Label>
                      <Input value={displayEmail} disabled className="h-11 opacity-60" />
                      <p className="text-xs text-slate-500">Email không thể thay đổi</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2 text-slate-700">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      Địa chỉ
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                      className="h-11 disabled:opacity-60"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending}
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateProfile.isPending}
                        size="lg"
                        className="flex-1 bg-transparent"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Bảo mật tài khoản</CardTitle>
                <CardDescription>Quản lý mật khẩu và cài đặt bảo mật của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Mật khẩu</p>
                    <p className="text-sm text-slate-600 mt-1">Đổi mật khẩu định kỳ để bảo mật tài khoản của bạn</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push("/change-password")} className="ml-4">
                    Đổi mật khẩu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
