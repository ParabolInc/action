import {GraphQLBoolean, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import makeMutationPayload from '../../types/makeMutationPayload'

export const EnableSAMLForDomainSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EnableSAMLForDomainSuccess',
  fields: () => ({
    success: {
      type: GraphQLNonNull(GraphQLBoolean)
    }
  })
})

const EnableSAMLForDomainPayload = makeMutationPayload(
  'EnableSAMLForDomainPayload',
  EnableSAMLForDomainSuccess
)

export default EnableSAMLForDomainPayload
