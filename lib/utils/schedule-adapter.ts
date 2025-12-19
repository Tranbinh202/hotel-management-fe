/**
 * Adapter to convert Weekly Schedule API response to the old EmployeeSchedule format
 * This allows us to use the new API while keeping the existing UI unchanged
 */

import type {
    WeeklyScheduleData,
    EmployeeSchedule,
    ShiftType,
} from "@/lib/types/api"

/**
 * Map time ranges to shift types
 * More reliable than name matching since API returns "Ca Đêm (00:00 - 08:00)"
 */
function getShiftTypeFromTime(startTime: string, endTime: string): ShiftType {
    // Normalize time format (remove seconds if present)
    const start = startTime.substring(0, 5) // HH:mm
    const end = endTime.substring(0, 5)

    if (start === "08:00" && end === "16:00") return "morning"
    if (start === "16:00" && end === "00:00") return "afternoon"
    if (start === "00:00" && end === "08:00") return "night"
    if (start === "22:00" && end === "06:00") return "night"

    // Default fallback based on start time
    const hour = parseInt(start.split(":")[0])
    if (hour >= 6 && hour < 14) return "morning"
    if (hour >= 14 && hour < 22) return "afternoon"
    return "night"
}

/**
 * Convert Weekly Schedule API response to legacy EmployeeSchedule array
 */
export function convertWeeklyScheduleToEmployeeSchedules(
    weeklyData: WeeklyScheduleData
): EmployeeSchedule[] {
    const schedules: EmployeeSchedule[] = []

    console.log("🔄 Converting weekly schedule data:", weeklyData)

    // Iterate through each shift type
    weeklyData.shifts.forEach((shift) => {
        // Map based on time range instead of name
        const shiftType = getShiftTypeFromTime(shift.startTime, shift.endTime)

        console.log(`  Shift: ${shift.shiftName} -> ${shiftType}`)

        // Iterate through each day in the shift
        shift.dailySchedules.forEach((dailySchedule) => {
            // Iterate through each employee scheduled for this day
            dailySchedule.employees.forEach((employee) => {
                schedules.push({
                    scheduleId: employee.scheduleId,
                    employeeId: employee.employeeId,
                    employeeName: employee.employeeName,
                    employeeRole: employee.employeeType,
                    employeeAvatar: undefined, // Not provided by new API
                    date: dailySchedule.shiftDate,
                    shiftType: shiftType,
                    shiftName: shift.shiftName,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    status: employee.status,
                    notes: employee.notes || undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                })
            })
        })
    })

    console.log(`✅ Converted ${schedules.length} schedules`)
    return schedules
}

/**
 * Convert shift type and date to API format for create/update
 */
export function getShiftTimesByType(shiftType: ShiftType): {
    startTime: string
    endTime: string
} {
    const shiftTimes: Record<ShiftType, { startTime: string; endTime: string }> = {
        morning: { startTime: "08:00:00", endTime: "16:00:00" },
        afternoon: { startTime: "16:00:00", endTime: "00:00:00" },
        night: { startTime: "00:00:00", endTime: "08:00:00" },
    }

    return shiftTimes[shiftType]
}
