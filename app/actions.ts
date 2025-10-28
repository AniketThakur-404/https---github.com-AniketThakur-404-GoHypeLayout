// app/actions.ts
'use server'

import { Resend } from 'resend'
import { ContactFormEmail } from './emails/ContactFormEmail'
import * as React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

interface FormData {
  name: string
  email: string
  company: string
  budget: string
  message: string
}

export async function sendEmail(formData: FormData) {
  const { name, email, company, budget, message } = formData

  if (!name || !email) {
    return { error: 'Name and Email are required fields.' }
  }

  try {
    const data = await resend.emails.send({
      from: 'GoHype Inquiry <onboarding@resend.dev>', // change to verified sender in prod
      to: ['leads@gohypemedia.com'],
      subject: `New Quote Request from ${name}`,
      react: ContactFormEmail({ name, email, company, budget, message }) as React.ReactElement,
    })

    if ((data as any)?.error) {
      console.error('Resend API Error:', (data as any).error)
      return { error: 'Email failed to send.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Server Action Error:', error)
    return { error: 'An unexpected error occurred.' }
  }
}
