interface Attachment {
  filename: string
  path: string
  cid: string
}

export interface MailManagerOptions {
  from?: string
  to: string | string[]
  subject: string
  body: string
  html: string
  attachments?: Attachment[]
  tags?: string[]
}
export default abstract class MailManager {
  abstract sendEmail(options: MailManagerOptions): Promise<boolean>
}
