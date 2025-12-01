"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoomTypesManagement from "@/components/admin/room-types-management"
import IndividualRoomsManagement from "@/components/admin/individual-rooms-management"

export default function RoomsPage() {
    const [activeTab, setActiveTab] = useState("rooms")

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-slate-900">Quản lý phòng</h1>
                    <p className="text-xs text-slate-600">Quản lý phòng và loại phòng</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-auto h-8">
                    <TabsTrigger
                        value="rooms"
                        className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e7e] data-[state=active]:to-[#a78bfa] data-[state=active]:text-white"
                    >
                        Danh sách phòng
                    </TabsTrigger>
                    <TabsTrigger
                        value="types"
                        className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff5e7e] data-[state=active]:to-[#a78bfa] data-[state=active]:text-white"
                    >
                        Loại phòng
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rooms" className="mt-2">
                    <IndividualRoomsManagement />
                </TabsContent>

                <TabsContent value="types" className="mt-2">
                    <RoomTypesManagement />
                </TabsContent>
            </Tabs>
        </div>
    )
}
