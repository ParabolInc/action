
const TemplateDimensionRefId = {
  join: (meetingId: string, dimensionRefIdx: string) => `dimensionRef:${meetingId}:${dimensionRefIdx}`,
  split: (id: string) => {
    const [, meetingId, dimensionRefIdx] = id.split(':')
    return {meetingId, dimensionRefIdx}
  }
}

export default TemplateDimensionRefId
