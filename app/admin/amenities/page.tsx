"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { SearchBar } from "@/components/shared/search-bar"
import { Modal, ConfirmModal } from "@/components/shared/modal"
import { AmenityForm } from "@/components/features/amenities/amenity-form"
import { AmenityList } from "@/components/features/amenities/amenity-list"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import {
  useAmenities,
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
  useToggleAmenityActive,
} from "@/lib/hooks/use-amenities"
import type { Amenity, CreateAmenityDto } from "@/lib/types/api"

export default function AmenitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Amenity | null>(null)

  const { data: amenities = [], isLoading } = useAmenities()
  const createMutation = useCreateAmenity()
  const updateMutation = useUpdateAmenity()
  const deleteMutation = useDeleteAmenity()
  const toggleActiveMutation = useToggleAmenityActive()

  const filteredAmenities = amenities.filter(
    (amenity) =>
      amenity.amenityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amenity.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (amenity?: Amenity) => {
    setEditingAmenity(amenity || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAmenity(null)
  }

  const handleSubmit = async (data: CreateAmenityDto) => {
    if (editingAmenity) {
      await updateMutation.mutateAsync({
        amenityId: editingAmenity.amenityId,
        ...data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }
    handleCloseModal()
  }

  const handleDelete = (amenity: Amenity) => {
    setDeleteConfirm(amenity)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm.amenityId)
      setDeleteConfirm(null)
    }
  }

  const handleToggleActive = async (amenity: Amenity) => {
    await toggleActiveMutation.mutateAsync(amenity.amenityId)
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý tiện nghi"
        description="Quản lý các tiện nghi và dịch vụ của khách sạn"
        action={{
          label: "Thêm tiện nghi",
          onClick: () => handleOpenModal(),
          icon: (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        }}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm kiếm tiện nghi..."
        resultCount={filteredAmenities.length}
      />

      {filteredAmenities.length === 0 && searchTerm ? (
        <EmptyState
          title="Không tìm thấy kết quả"
          description="Thử tìm kiếm với từ khóa khác"
          action={{
            label: "Xóa tìm kiếm",
            onClick: () => setSearchTerm(""),
          }}
        />
      ) : (
        <AmenityList
          amenities={filteredAmenities}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAmenity ? "Chỉnh sửa tiện nghi" : "Thêm tiện nghi mới"}
      >
        <AmenityForm
          amenity={editingAmenity || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tiện nghi "${deleteConfirm?.amenityName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  )
}
