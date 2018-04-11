graphql`
  fragment CompleteReflectionGroupFrag on RetroReflectionGroup {
    id
    title
    meetingId
    meeting {
      id
    }
    retroPhaseItemId
    phaseItem {
      id
    }
    reflections {
      id
    }
    sortOrder
    viewerVoteCount
    voteCount
  }
`;
