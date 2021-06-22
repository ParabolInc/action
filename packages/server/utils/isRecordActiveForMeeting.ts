const isRecordActiveForMeeting = (
  record: {createdAt: Date; removedAt?: null | Date},
  meetingCreatedAt: Date
) => {
  return (
    record.createdAt < meetingCreatedAt &&
    (!record.removedAt || meetingCreatedAt < record.removedAt)
  )
}

export default isRecordActiveForMeeting
