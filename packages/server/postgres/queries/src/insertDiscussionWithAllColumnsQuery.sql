/*
  @name insertDiscussionWithAllColumnsQuery
  @param discussions -> ((
    id,
    createdAt,
    teamId,
    meetingId,
    discussionTopicId,
    discussionTopicType
  )...)
*/
INSERT INTO "Discussion" (
  "id",
  "createdAt",
  "teamId",
  "meetingId",
  "discussionTopicId",
  "discussionTopicType"
)
VALUES :discussions;
