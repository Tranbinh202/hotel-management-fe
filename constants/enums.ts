export enum ApprovalStatus {
  Approved = "0",
  Pending = "1",
  Rejected = "2",
}

export const attendanceStatusMap = new Map<ApprovalStatus, string>([
  [ApprovalStatus.Approved, "Phê duyệt"],
  [ApprovalStatus.Pending, "Chờ duyệt"],
  [ApprovalStatus.Rejected, "Hủy"],

])