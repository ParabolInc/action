import TemplateScale from '../../../database/types/TemplateScale'
import segmentIo from '../../../utils/segmentIo'

const sendScaleEventToSegment = async (
  userId: string,
  scale: TemplateScale,
  event: 'Scale Created' | 'Scale Cloned'
) => {
  segmentIo.track({
    userId,
    event,
    properties: {
      scaleId: scale.id,
      scaleName: scale.name,
      teamId: scale.teamId
    }
  })
}

export default sendScaleEventToSegment
