"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoomTypesManagement from "@/components/admin/room-types-management"
import IndividualRoomsManagement from "@/components/admin/individual-rooms-management"

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState("rooms")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý phòng</h1>
          <p className="text-sm text-slate-600 mt-0.5">Quản lý phòng và loại phòng</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-2 h-9">
            <TabsTrigger
              value="rooms"
              className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e7e] data-[state=active]:to-[#a78bfa] data-[state=active]:text-white"
            >
              Danh sách phòng
            </TabsTrigger>
            <TabsTrigger
              value="types"
              className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e7e] data-[state=active]:to-[#a78bfa] data-[state=active]:text-white"
            >
              Loại phòng
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <TabsContent value="rooms" className="mt-0">
          <IndividualRoomsManagement />
        </TabsContent>

        <TabsContent value="types" className="mt-0">
          <RoomTypesManagement />
        </TabsContent>
      </div>
    </div>
  )
}
