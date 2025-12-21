"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSearchCustomer,
  useSearchAvailableRoomTypes,
  useCheckAvailableRooms,
  useCreateOfflineBooking,
} from "@/lib/hooks/use-offline-bookings";
import { usePaymentMethods } from "@/lib/hooks/use-common-code";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Loader2,
  User,
  Calendar as CalendarIcon,
  CreditCard,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  CustomerSearchResult,
  CreateOfflineBookingDto,
  OfflineBookingResponse,
  RoomTypeAvailability,
} from "@/lib/types/api";

interface SelectedRoom {
  roomId: number;
  roomName: string;
  roomTypeId: number;
  roomTypeName: string;
  pricePerNight: number;
  floor: number;
}

export default function NewOfflineBookingPage() {
  const router = useRouter();

  // Search state
  const [searchKey, setSearchKey] = useState("");
  const [debouncedSearchKey, setDebouncedSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>(
    []
  );

  // Form state
  const [formData, setFormData] = useState<CreateOfflineBookingDto>({
    customerId: null,
    fullName: "",
    email: "",
    phoneNumber: "",
    identityCard: "",
    address: "",
    roomIds: [],
    checkInDate: "",
    checkOutDate: "",
    specialRequests: "",
    paymentMethod: "Cash",
    paymentNote: "",
  });

  // Room search state
  const [availableRoomTypes, setAvailableRoomTypes] = useState<
    RoomTypeAvailability[]
  >([]);
  const [isAvailabilityChecked, setIsAvailabilityChecked] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);

  // Booking state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingResult, setBookingResult] =
    useState<OfflineBookingResponse | null>(null);

  // Debounce search key
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchKey);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKey]);

  // React Query hooks
  const { data: customerSearchData, isLoading: isSearching } =
    useSearchCustomer(debouncedSearchKey);
  const { data: paymentMethods = [] } = usePaymentMethods();

  const searchRoomTypesMutation = useSearchAvailableRoomTypes();
  const checkAvailabilityMutation = useCheckAvailableRooms();
  const createBookingMutation = useCreateOfflineBooking();

  const fallbackPaymentMethods = [
    { codeName: "Cash", codeValue: "Tiền mặt" },
    { codeName: "Card", codeValue: "Thẻ" },
    { codeName: "Transfer", codeValue: "Chuyển khoản" },
  ];
  const paymentMethodOptions =
    paymentMethods.length > 0 ? paymentMethods : fallbackPaymentMethods;
  const defaultPaymentMethod = paymentMethodOptions[0]?.codeName ?? "Cash";
  const parseLocalDateTime = (value: string) => {
    if (!value) return undefined;
    const normalized = value.includes("T") ? value : `${value}T00:00`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };
  const checkInDateValue = parseLocalDateTime(formData.checkInDate);
  const checkOutDateValue = parseLocalDateTime(formData.checkOutDate);
  const toDateTimeValue = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");
  const toTimeInputValue = (date?: Date) => (date ? format(date, "HH:mm") : "");

  // Handle customer search results
  useEffect(() => {
    if (customerSearchData?.isSuccess && customerSearchData.data.length > 0) {
      setSearchResults(customerSearchData.data);

      // Don't auto-fill if multiple results - let user choose
      // Only auto-fill if exactly one result
      // if (customerSearchData.data.length === 1) {
      //     handleSelectCustomer(customerSearchData.data[0])
      // }
    } else if (
      debouncedSearchKey.length >= 3 &&
      customerSearchData?.isSuccess &&
      customerSearchData.data.length === 0
    ) {
      // Only show "not found" toast if user typed at least 3 characters
      toast({
        title: "Không tìm thấy",
        description: "Không tìm thấy khách hàng. Vui lòng nhập thông tin mới.",
      });
      setSearchResults([]);

      // Pre-fill phone if it looks like a phone number
      if (/^\d{10,11}$/.test(debouncedSearchKey)) {
        setFormData((prev) => ({ ...prev, phoneNumber: debouncedSearchKey }));
      }
    }
  }, [customerSearchData, debouncedSearchKey]);

  useEffect(() => {
    if (paymentMethodOptions.length === 0) return;
    setFormData((prev) => {
      const exists = paymentMethodOptions.some(
        (method) => method.codeName === prev.paymentMethod
      );
      if (exists) return prev;
      return { ...prev, paymentMethod: defaultPaymentMethod };
    });
  }, [paymentMethodOptions, defaultPaymentMethod]);

  // Select customer from search results
  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer.customerId,
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      identityCard: customer.identityCard || "",
      address: customer.address || "",
    }));

    toast({
      title: "Đã chọn khách hàng",
      description: `${customer.fullName} - Đã đặt ${customer.totalBookings} lần`,
    });

    setSearchResults([]);
    setSearchKey("");
  };

  // Search available rooms
  const handleSearchRooms = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày nhận phòng và trả phòng",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAvailabilityChecked(false);
      setSelectedRooms([]);
      setAvailableRoomTypes([]);
      setFormData((prev) => ({ ...prev, roomIds: [] }));
      if (searchRoomTypesMutation.reset) searchRoomTypesMutation.reset();
      if (checkAvailabilityMutation.reset) checkAvailabilityMutation.reset();

      const roomTypesResponse = await searchRoomTypesMutation.mutateAsync({
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        pageNumber: 1,
        pageSize: 50,
      });

      if (!roomTypesResponse.isSuccess) {
        throw new Error(
          roomTypesResponse.message || "Không thể tìm phòng trống"
        );
      }

      const availableTypes = roomTypesResponse.data.filter(
        (rt) => rt.availableRoomCount > 0
      );
      const totalRooms = availableTypes.reduce(
        (sum, rt) => sum + rt.availableRoomCount,
        0
      );

      if (availableTypes.length === 0 || totalRooms === 0) {
        toast({
          title: "Hết phòng",
          description: "Không còn phòng trống trong khoảng thời gian này",
          variant: "destructive",
        });
        return;
      }

      const availabilityPayload = {
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        roomTypes: availableTypes.map((rt) => ({
          roomTypeId: rt.roomTypeId,
          quantity: 1,
        })),
      };

      const availabilityResponse = await checkAvailabilityMutation.mutateAsync(
        availabilityPayload
      );

      if (!availabilityResponse.isSuccess) {
        throw new Error(
          availabilityResponse.message || "Không thể kiểm tra phòng trống"
        );
      }

      setAvailableRoomTypes(availabilityResponse.data.roomTypes || []);
      setIsAvailabilityChecked(true);

      toast({
        title: "Tìm thấy phòng",
        description: `Có ${totalRooms} phòng trống trong ${availableTypes.length} loại phòng`,
      });
    } catch (error: any) {
      setIsAvailabilityChecked(false);
      toast({
        title: "Lỗi tìm phòng",
        description: error.message || "Không thể tìm phòng trống",
        variant: "destructive",
      });
    }
  };

  const toggleRoomSelection = (
    room: any,
    roomTypeName: string,
    defaultPrice: number
  ) => {
    setSelectedRooms((prev) => {
      const exists = prev.find((r) => r.roomId === room.roomId);
      if (exists) {
        return prev.filter((r) => r.roomId !== room.roomId);
      }

      const newRoom: SelectedRoom = {
        roomId: room.roomId,
        roomName: room.roomName,
        roomTypeId: room.roomTypeId,
        roomTypeName,
        pricePerNight: room.pricePerNight ?? defaultPrice,
        floor: room.floor ?? 0,
      };
      return [...prev, newRoom];
    });
  };

  // Calculate total
  const calculateTotal = () => {
    if (
      !formData.checkInDate ||
      !formData.checkOutDate ||
      selectedRooms.length === 0
    ) {
      return { nights: 0, totalAmount: 0, totalRooms: 0 };
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.floor(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalAmount = selectedRooms.reduce(
      (sum, room) => sum + room.pricePerNight * nights,
      0
    );
    const totalRooms = selectedRooms.length;

    return { nights, totalAmount, totalRooms };
  };

  // Submit booking
  const handleConfirmBooking = () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ tên khách hàng",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.phoneNumber.trim() ||
      formData.phoneNumber.trim().length < 10
    ) {
      toast({
        title: "Lỗi",
        description: "Số điện thoại không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (selectedRooms.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn phòng trước khi đặt",
        variant: "destructive",
      });
      return;
    }

    if (!isAvailabilityChecked) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra phòng trống trước khi đặt",
        variant: "destructive",
      });
      return;
    }

    // Update roomIds in formData
    const updatedFormData = {
      ...formData,
      roomIds: selectedRooms.map((r) => r.roomId),
    };

    createBookingMutation.mutate(updatedFormData, {
      onSuccess: (response) => {
        if (response.isSuccess) {
          setBookingResult(response.data);
          setShowSuccessModal(true);

          toast({
            title: "Đặt phòng thành công",
            description: `Mã booking: #${response.data.booking.bookingId}`,
          });
        }
      },
      onError: (error: any) => {
        toast({
          title: "Đặt phòng thất bại",
          description: error.message || "Không thể tạo booking",
          variant: "destructive",
        });
      },
    });
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      customerId: null,
      fullName: "",
      email: "",
      phoneNumber: "",
      identityCard: "",
      address: "",
      roomIds: [],
      checkInDate: "",
      checkOutDate: "",
      specialRequests: "",
      paymentMethod: defaultPaymentMethod,
      paymentNote: "",
    });
    setAvailableRoomTypes([]);
    setSelectedRooms([]);
    setSearchResults([]);
    setSearchKey("");
    setIsAvailabilityChecked(false);
    if (searchRoomTypesMutation.reset) searchRoomTypesMutation.reset();
    if (checkAvailabilityMutation.reset) checkAvailabilityMutation.reset();
  };

  const { nights, totalAmount, totalRooms } = calculateTotal();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          📝 Đặt Phòng Tại Quầy
        </h1>
        <p className="text-slate-600 mt-2">
          Tạo booking cho khách hàng đến trực tiếp
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm khách hàng
              </CardTitle>
              <CardDescription>
                Nhập số điện thoại, email hoặc tên để tìm khách hàng có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Số điện thoại / Email / Tên (tự động tìm)"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    Kết quả tìm kiếm ({searchResults.length} khách hàng):
                  </Label>
                  {searchResults.map((customer) => (
                    <Card
                      key={customer.customerId}
                      className="cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-l-blue-500"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg">
                                {customer.fullName}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {customer.matchedBy === "Name"
                                  ? "Tên"
                                  : customer.matchedBy === "Phone"
                                    ? "SĐT"
                                    : "Email"}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p>
                                📞{" "}
                                {customer.phoneNumber || (
                                  <span className="text-slate-400">
                                    Chưa có SĐT
                                  </span>
                                )}
                              </p>
                              <p>
                                📧{" "}
                                {customer.email || (
                                  <span className="text-slate-400">
                                    Chưa có email
                                  </span>
                                )}
                              </p>
                              {customer.identityCard && (
                                <p>🆔 {customer.identityCard}</p>
                              )}
                              {customer.address && <p>📍 {customer.address}</p>}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-300"
                              >
                                ✓ Đã đặt {customer.totalBookings} lần
                              </Badge>
                              {customer.lastBookingDate && (
                                <span className="text-xs text-slate-500">
                                  Lần cuối:{" "}
                                  {format(
                                    new Date(customer.lastBookingDate),
                                    "dd/MM/yyyy",
                                    { locale: vi }
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ tên *</Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="0901234567"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identityCard">CMND/CCCD</Label>
                  <Input
                    id="identityCard"
                    placeholder="001234567890"
                    value={formData.identityCard}
                    onChange={(e) =>
                      setFormData({ ...formData, identityCard: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  placeholder="123 Đường ABC, TP.HCM"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Thông tin đặt phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày nhận phòng *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr,140px] gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !checkInDateValue && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDateValue
                            ? format(checkInDateValue, "dd/MM/yyyy", { locale: vi })
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkInDateValue}
                          onSelect={(date) => {
                            if (!date) {
                              setFormData({ ...formData, checkInDate: "" });
                              return;
                            }
                            const base = checkInDateValue ?? new Date();
                            const next = new Date(date);
                            next.setHours(base.getHours(), base.getMinutes(), 0, 0);
                            setFormData((prev) => {
                              const nextValue = toDateTimeValue(next);
                              const nextState = { ...prev, checkInDate: nextValue };
                              if (prev.checkOutDate) {
                                const checkOut = parseLocalDateTime(prev.checkOutDate);
                                if (checkOut && checkOut <= next) {
                                  nextState.checkOutDate = "";
                                }
                              }
                              return nextState;
                            });
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ngày trả phòng *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr,140px] gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !checkOutDateValue && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDateValue
                            ? format(checkOutDateValue, "dd/MM/yyyy", { locale: vi })
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOutDateValue}
                          onSelect={(date) => {
                            if (!date) {
                              setFormData({ ...formData, checkOutDate: "" });
                              return;
                            }
                            const next = new Date(date);
                            next.setHours(12, 0, 0, 0);
                            setFormData({ ...formData, checkOutDate: toDateTimeValue(next) });
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (checkInDateValue) {
                              const checkInDay = new Date(checkInDateValue);
                              checkInDay.setHours(0, 0, 0, 0);
                              return date < checkInDay;
                            }
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearchRooms}
                disabled={
                  searchRoomTypesMutation.isPending ||
                  checkAvailabilityMutation.isPending ||
                  !formData.checkInDate ||
                  !formData.checkOutDate
                }
                className="w-full"
              >
                {searchRoomTypesMutation.isPending ||
                  checkAvailabilityMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang kiểm tra phòng...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Tìm phòng trống
                  </>
                )}
              </Button>

              {/* Available Room Types */}
              {searchRoomTypesMutation.data?.data &&
                searchRoomTypesMutation.data.data.length > 0 && (
                  <div className="space-y-4">
                    <Label>
                      Chọn phòng (
                      {availableRoomTypes.reduce(
                        (total, rt) => total + (rt.availableRooms?.length || 0),
                        0
                      )}{" "}
                      phòng trống)
                    </Label>

                    {!isAvailabilityChecked && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tải phòng trống...
                      </div>
                    )}

                    <div className="space-y-3 max-h-[520px] overflow-y-auto">
                      {searchRoomTypesMutation.data.data.map((roomType) => {
                        const availability = availableRoomTypes.find(
                          (rt) => rt.roomTypeId === roomType.roomTypeId
                        );
                        const availableRooms =
                          availability?.availableRooms || [];
                        const selectedCount = selectedRooms.filter(
                          (r) => r.roomTypeId === roomType.roomTypeId
                        ).length;

                        return (
                          <Card
                            key={roomType.roomTypeId}
                            className="transition-all hover:shadow-md"
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-lg">
                                      {roomType.typeName}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {roomType.typeCode}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                    {roomType.description}
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-700">
                                    <span>
                                      💰{" "}
                                      {roomType.basePriceNight.toLocaleString(
                                        "vi-VN"
                                      )}{" "}
                                      VNĐ/đêm
                                    </span>
                                    <span>
                                      👥 {roomType.maxOccupancy} người
                                    </span>
                                    <span>📏 {roomType.roomSize}m²</span>
                                    <span>
                                      🛏️ {roomType.numberOfBeds}{" "}
                                      {roomType.bedType}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0"
                                  >
                                    {roomType.availableRoomCount}/
                                    {roomType.totalRoomCount} trống
                                  </Badge>
                                  <Badge
                                    variant={
                                      availableRooms.length > 0
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {availableRooms.length > 0
                                      ? `${availableRooms.length} phòng khả dụng`
                                      : "Hết phòng"}
                                  </Badge>
                                  {selectedCount > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      Đã chọn {selectedCount} phòng
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                {availableRooms.length === 0 ? (
                                  <p className="text-sm text-slate-500 italic">
                                    Không còn phòng trống cho loại phòng này.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {availableRooms.map((room) => {
                                      const isSelected = selectedRooms.some(
                                        (r) => r.roomId === room.roomId
                                      );
                                      const displayPrice = (
                                        room.pricePerNight ??
                                        roomType.basePriceNight
                                      ).toLocaleString("vi-VN");
                                      const floorLabel = room.floor ?? "-";
                                      return (
                                        <Card
                                          key={room.roomId}
                                          className={`cursor-pointer transition-all ${isSelected
                                              ? "border-blue-500 bg-blue-50"
                                              : "hover:bg-slate-50"
                                            }`}
                                          onClick={() =>
                                            toggleRoomSelection(
                                              room,
                                              roomType.typeName,
                                              roomType.basePriceNight
                                            )
                                          }
                                        >
                                          <CardContent className="p-3">
                                            <div className="flex items-center gap-2">
                                              <Checkbox checked={isSelected} />
                                              <div className="flex-1">
                                                <p className="font-medium">
                                                  {room.roomName}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                  Tầng {floorLabel} •{" "}
                                                  {displayPrice} VNĐ/đêm
                                                </p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Payment & Notes */}
          {/* <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Thanh toán & Ghi chú
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Phương thức thanh toán *</Label>
                                <RadioGroup
                                    value={formData.paymentMethod}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, paymentMethod: value as CreateOfflineBookingDto["paymentMethod"] })
                                    }
                                >
                                    {paymentMethodOptions.map((method) => (
                                        <div key={method.codeName} className="flex items-center space-x-2">
                                            <RadioGroupItem value={method.codeName} id={`payment-${method.codeName}`} />
                                            <Label htmlFor={`payment-${method.codeName}`} className="cursor-pointer">
                                                {method.codeValue}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                                <Textarea
                                    id="specialRequests"
                                    placeholder="Ví dụ: Phòng tầng cao, view đẹp..."
                                    value={formData.specialRequests}
                                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentNote">Ghi chú thanh toán</Label>
                                <Input
                                    id="paymentNote"
                                    placeholder="Ví dụ: Đã thanh toán tiền mặt..."
                                    value={formData.paymentNote}
                                    onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card> */}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Tóm tắt đặt phòng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Rooms */}
              {selectedRooms.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Phòng đã chọn:
                  </Label>
                  {selectedRooms.map((room) => (
                    <div
                      key={room.roomId}
                      className="text-sm p-2 bg-slate-50 rounded"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{room.roomName}</p>
                          <p className="text-slate-600 text-xs">
                            {room.roomTypeName} - Tầng {room.floor}
                          </p>
                          <p className="text-slate-600 text-xs">
                            {room.pricePerNight.toLocaleString("vi-VN")} VNĐ/đêm
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Pricing */}
              {nights > 0 && totalRooms > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số đêm:</span>
                    <span className="font-medium">{nights} đêm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng số phòng:</span>
                    <span className="font-medium">{totalRooms} phòng</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Tổng cộng:</span>
                    <span className="font-bold text-blue-600">
                      {totalAmount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleConfirmBooking}
                disabled={
                  createBookingMutation.isPending ||
                  selectedRooms.length === 0 ||
                  !isAvailabilityChecked
                }
                className="w-full bg-linear-to-r from-[#00008b] to-[#ffd700] hover:from-[#00006b] hover:to-[#e6c200] text-white"
                size="lg"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Xác nhận đặt phòng
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Làm mới
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Đặt phòng thành công!
            </DialogTitle>
            <DialogDescription>
              Booking đã được tạo và xác nhận thành công
            </DialogDescription>
          </DialogHeader>

          {bookingResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Mã booking:</p>
                  <p className="font-bold text-lg">
                    #{bookingResult.booking.bookingId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Khách hàng:</p>
                  <p className="font-semibold">
                    {bookingResult.booking.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Phòng:</p>
                  <p className="font-medium">
                    {bookingResult.booking.roomNames.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Tổng tiền:</p>
                  <p className="font-bold text-blue-600">
                    {bookingResult.booking.totalAmount.toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                // Print functionality would go here
                toast({
                  title: "In hóa đơn",
                  description: "Chức năng in đang được phát triển",
                });
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              In hóa đơn
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                handleReset();
                router.push("/receptionist/bookings");
              }}
            >
              Hoàn tất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
