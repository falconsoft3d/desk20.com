import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    // Skip sending if no SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('Email skipped - No SMTP configuration')
      return { success: false, message: 'No SMTP configuration' }
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function getTicketCreatedEmailTemplate(data: {
  customerName: string
  ticketNumber: number
  subject: string
  description: string
}) {
  return {
    subject: `Ticket #${data.ticketNumber} creado - ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .ticket-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket Creado</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.customerName}</strong>,</p>
            <p>Tu ticket ha sido creado exitosamente. Nuestro equipo de soporte lo revisará pronto.</p>
            
            <div class="ticket-info">
              <h2>Ticket #${data.ticketNumber}</h2>
              <p><strong>Asunto:</strong> ${data.subject}</p>
              <p><strong>Descripción:</strong></p>
              <p>${data.description}</p>
            </div>

            <p>Te notificaremos por email cuando haya actualizaciones en tu ticket.</p>
            <p>Gracias por contactarnos.</p>
          </div>
          <div class="footer">
            <p>Desk20 - Sistema de Soporte Técnico</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function getTicketReplyEmailTemplate(data: {
  customerName: string
  ticketNumber: number
  subject: string
  replyContent: string
  agentName: string
}) {
  return {
    subject: `Re: Ticket #${data.ticketNumber} - ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .reply-box { background-color: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva Respuesta en tu Ticket</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.customerName}</strong>,</p>
            <p>Has recibido una nueva respuesta en tu ticket <strong>#${data.ticketNumber}</strong>.</p>
            
            <div class="reply-box">
              <p><strong>${data.agentName}</strong> respondió:</p>
              <p>${data.replyContent}</p>
            </div>

            <p>Puedes responder directamente a este ticket desde tu portal de soporte.</p>
          </div>
          <div class="footer">
            <p>Desk20 - Sistema de Soporte Técnico</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}
