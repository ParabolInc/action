import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'
import validateAvatarUpload from '../../fileStorage/validateAvatarUpload'
import generateUID from '../../generateUID'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import getS3SignedPutUrl from '../../utils/getS3SignedPutUrl'
import standardError from '../../utils/standardError'
import CreatePicturePutUrlPayload from '../types/CreatePicturePutUrlPayload'

const createOrgPicturePutUrl = {
  type: CreatePicturePutUrlPayload,
  deprecationReason: 'Replaced with `uploadOrgImage` mutation',
  description: 'Create a PUT URL on the CDN for an organization’s profile picture',
  args: {
    contentType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'user-supplied MIME content type'
    },
    contentLength: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'user-supplied file size'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization id to update'
    }
  },
  async resolve(source, {orgId, contentType, contentLength}, {authToken, dataLoader}) {
    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // VALIDATION
    const ext = validateAvatarUpload(contentType, contentLength)

    // RESOLUTION
    const partialPath = `Organization/${orgId}/picture/${generateUID()}.${ext}`
    const url = await getS3SignedPutUrl(contentType, contentLength, partialPath)
    return {url}
  }
}

export default createOrgPicturePutUrl
