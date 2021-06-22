/**
 * The password reset page. Allows the user to reset their password via email.
 *
 */
import React, {Fragment, useState} from 'react'
import styled from '@emotion/styled'
import EmailInputField from './EmailInputField'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'
import {emailRegex} from '../validation/regex'
import Legitity from '../validation/Legitity'
import AuthenticationDialog from './AuthenticationDialog'
import {GotoAuthPage} from './GenericAuthentication'
import DialogTitle from './DialogTitle'
import {PALETTE} from '../styles/paletteV3'
import IconLabel from './IconLabel'
import EmailPasswordResetMutation from '../mutations/EmailPasswordResetMutation'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  email?: string
  gotoPage: GotoAuthPage
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const P = styled('p')({
  fontSize: 14,
  lineHeight: 1.5,
  margin: '16px 0',
  textAlign: 'center'
})

const Container = styled('div')({
  margin: '0 auto',
  maxWidth: 240,
  width: '100%'
})

const LinkButton = styled(PlainButton)({
  color: PALETTE.SKY_500,
  ':hover': {
    color: PALETTE.SKY_500,
    textDecoration: 'underline'
  }
})

const SubmitButton = styled(PrimaryButton)({
  marginTop: 16
})

const StyledPrimaryButton = styled(PrimaryButton)({
  margin: '16px auto 0',
  width: 240
})

const BrandedLink = styled(PlainButton)({
  color: PALETTE.SKY_500,
  ':hover,:focus': {
    color: PALETTE.SKY_500,
    textDecoration: 'underline'
  }
})

const DialogSubTitle = styled('div')({
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
  paddingTop: 16,
  paddingBottom: 24
})

const validateEmail = (email) => {
  return new Legitity(email)
    .trim()
    .required('Please enter an email address')
    .matches(emailRegex, 'Please enter a valid email address')
}

const ForgotPasswordPage = (props: Props) => {
  const {gotoPage} = props
  const [isSent, setIsSent] = useState(false)
  const {submitMutation, submitting, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {validateField, setDirtyField, onChange, fields} = useForm({
    email: {
      getDefault: () => {
        const params = new URLSearchParams(window.location.search)
        const email = params.get('email')
        return props.email || email || ''
      },
      validate: validateEmail
    }
  })

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const {name} = e.target
    setDirtyField(name)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setDirtyField()
    const {email: emailRes} = validateField()
    if (emailRes.error) return
    const email = emailRes.value as string
    submitMutation()
    EmailPasswordResetMutation(
      atmosphere,
      {email},
      {
        onCompleted: () => { },
        onError: () => { }
      }
    )
    onCompleted()
    setIsSent(true)
  }

  const resetState = () => {
    onCompleted()
    setIsSent(false)
  }

  const gotoSignIn = () => {
    const params = new URLSearchParams(location.search)
    params.delete('email')
    gotoPage('signin', params.toString())
  }

  return (
    <AuthenticationDialog>
      <DialogTitle>{isSent ? 'You’re all set!' : 'Forgot your password?'}</DialogTitle>
      {!isSent && (
        <DialogSubTitle>
          <span>{isSent ? '' : 'Remember it? '}</span>
          <BrandedLink onClick={gotoSignIn}>{isSent ? '' : 'Sign in with password'}</BrandedLink>
        </DialogSubTitle>
      )}
      <Container>
        {isSent ? (
          <Fragment>
            <P>{'We’ve sent you an email with password recovery instructions.'}</P>
            <P>
              {'Didn’t get it? Check your spam folder, or '}
              <LinkButton onClick={resetState}>click here</LinkButton>
              {' to try again.'}
            </P>
            <StyledPrimaryButton onClick={gotoSignIn} size='medium'>
              <IconLabel icon='arrow_back' label='Back to Sign In' />
            </StyledPrimaryButton>
          </Fragment>
        ) : (
          <Fragment>
            <P>
              {
                'Confirm your email address, and we’ll send you an email with password recovery instructions.'
              }
            </P>
            <Form onSubmit={onSubmit}>
              <EmailInputField
                {...fields.email}
                autoFocus
                onChange={onChange}
                onBlur={handleBlur}
              />
              <SubmitButton size='medium' waiting={submitting}>
                {'Send Email'}
              </SubmitButton>
            </Form>
          </Fragment>
        )}
      </Container>
    </AuthenticationDialog>
  )
}

export default ForgotPasswordPage
