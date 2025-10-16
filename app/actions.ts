"use server";

import { Resend } from 'resend';
import { ContactFormEmail } from './emails/ContactFormEmail';
import * as React from 'react';

// Initialize Resend with the secret API key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the shape of our form data
interface FormData {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
}

export async function sendEmail(formData: FormData) {
  const { name, email, company, budget, message } = formData;

  // Basic validation
  if (!name || !email) {
    return { error: 'Name and Email are required fields.' };
  }
  
  try {
    const data = await resend.emails.send({
      from: 'GoHype Inquiry <onboarding@resend.dev>', // For testing. Change to your verified domain for production.
      to: ['leads@gohypemedia.com'], // The email address that will receive the form submissions.
      subject: `New Quote Request from ${name}`,
      react: ContactFormEmail({ name, email, company, budget, message }) as React.ReactElement,
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return { error: 'Email failed to send.' };
    }

    return { success: true };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { error: 'An unexpected error occurred.' };
  }
}