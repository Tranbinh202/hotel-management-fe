"use client"

import type React from "react"

import { useState } from "react"
import { useMyAccountSummary, useUpdateAcountProfile } from "@/lib/hooks/use-account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, User, Phone, Calendar, Briefcase, Save, X, Shield } from "lucide-react"
import { fileApi } from "@/lib/api/file"
import { toast } from "sonner"
import type { EmployeeProfileDetails } from "@/lib/types/api"

export default function AdminProfilePage() {
  const { data: accountSummary, isLoading } = useMyAccountSummary()
  const updateProfile = useUpdateAcountProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  })

  // Initialize form data when profile loads
  useState(() => {
    if (accountSummary && accountSummary.accountType === "Employee") {
      const profile = accountSummary.profileDetails as EmployeeProfileDetails
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
      })
    }
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const uploadResult = await fileApi.upload(file)
      setAvatarUrl(uploadResult.secureUrl)
      toast.success("Ảnh đại diện đã được tải lên")
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      toast.error("Không thể tải lên ảnh đại diện")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProfile.mutateAsync({
        ...formData,
        ...(avatarUrl && { avatarUrl }),
      })
      toast.success("Cập nhật thông tin thành công")
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Không thể cập nhật thông tin")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!accountSummary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-600">Không tìm thấy thông tin tài khoản</p>
      </div>
    )
  }

  const profile = accountSummary.profileDetails as EmployeeProfileDetails
  const displayName = profile.fullName || accountSummary.username
  const displayEmail = accountSummary.email

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Thông tin cá nhân</h1>
        <p className="text-slate-600 mt-2">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-slate-200 text-slate-700">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
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

              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-900">{displayName}</h2>
                <p className="text-slate-600 mt-1">{displayEmail}</p>
                <div className="flex gap-2 mt-4">
                  {accountSummary.roles.map((role) => (
                    <span key={role} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      <Shield className="inline h-3 w-3 mr-1" />
                      {role}
                    </span>
                  ))}
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      profile.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {profile.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
              </div>

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhân viên</CardTitle>
            <CardDescription>Thông tin cá nhân và công việc</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    <User className="inline h-4 w-4 mr-2" />
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    placeholder="0123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Chức vụ
                  </Label>
                  <Input value={profile.employeeTypeName} disabled />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Ngày vào làm
                  </Label>
                  <Input value={new Date(profile.hireDate).toLocaleDateString("vi-VN")} disabled />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={updateProfile.isPending}>
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
                    onClick={() => setIsEditing(false)}
                    disabled={updateProfile.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Thông tin hệ thống và trạng thái tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600">Tên đăng nhập</p>
                <p className="font-medium text-slate-900">{accountSummary.username}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium text-slate-900">{accountSummary.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Trạng thái tài khoản</p>
                <p className="font-medium">
                  {accountSummary.isLocked ? (
                    <span className="text-red-600">Đã khóa</span>
                  ) : (
                    <span className="text-green-600">Hoạt động</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Loại tài khoản</p>
                <p className="font-medium text-slate-900">{accountSummary.accountType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Đăng nhập lần cuối</p>
                <p className="font-medium text-slate-900">
                  {new Date(accountSummary.lastLoginAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Ngày tạo</p>
                <p className="font-medium text-slate-900">
                  {new Date(accountSummary.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê công việc</CardTitle>
            <CardDescription>Thông tin về hiệu suất và hoạt động</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Nhiệm vụ được giao</p>
                <p className="text-2xl font-bold text-slate-900">{accountSummary.statistics?.totalTasksAssigned || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Nhiệm vụ hoàn thành</p>
                <p className="text-2xl font-bold text-green-700">{accountSummary.statistics?.completedTasks || 0}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Nhiệm vụ đang chờ</p>
                <p className="text-2xl font-bold text-yellow-700">{accountSummary.statistics?.pendingTasks || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Số ngày làm việc</p>
                <p className="text-2xl font-bold text-blue-700">{accountSummary.statistics?.workingDays || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Điểm danh</p>
                <p className="text-2xl font-bold text-purple-700">{accountSummary.statistics?.totalAttendance || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Thông báo chưa đọc</p>
                <p className="text-2xl font-bold text-slate-900">
                  {accountSummary.statistics?.unreadNotifications || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
