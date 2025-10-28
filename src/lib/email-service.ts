import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BillEmailData {
  consumerName: string
  email: string
  waterMeterNo: string
  billingMonth: string
  previousReading: number
  presentReading: number
  consumption: number
  amountCurrentBilling: number
  dueDate: string
  paymentStatus: string
  address?: string
  phone?: string
}

export class EmailService {
  /**
   * Send water bill email to consumer
   */
  static async sendBillEmail(billData: BillEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not configured')
        return { success: false, error: 'Email service not configured' }
      }

      const emailHtml = this.generateBillEmailHtml(billData)
      
      const { data, error } = await resend.emails.send({
        from: 'BAWASA System <noreply@bawasa-system.com>',
        to: [billData.email],
        subject: `Water Bill - ${billData.billingMonth} | Meter: ${billData.waterMeterNo}`,
        html: emailHtml,
      })

      if (error) {
        console.error('❌ Error sending email:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Email sent successfully:', data?.id)
      return { success: true }

    } catch (error) {
      console.error('💥 Unexpected error sending email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Generate HTML email template for water bill
   */
  private static generateBillEmailHtml(billData: BillEmailData): string {
    const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Water Bill - ${billData.billingMonth}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .bill-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .bill-info h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
        }
        .info-value {
            color: #2d3748;
        }
        .amount-highlight {
            background-color: #1e40af;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .amount-highlight .amount {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
        }
        .amount-highlight .label {
            font-size: 14px;
            opacity: 0.9;
            margin: 5px 0 0 0;
        }
        .due-date {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .due-date .date {
            font-size: 20px;
            font-weight: bold;
            color: #92400e;
            margin: 0;
        }
        .due-date .label {
            font-size: 14px;
            color: #92400e;
            margin: 5px 0 0 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-unpaid {
            background-color: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        .status-paid {
            background-color: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }
        .status-partial {
            background-color: #fffbeb;
            color: #d97706;
            border: 1px solid #fed7aa;
        }
        .status-overdue {
            background-color: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 BAWASA Water Bill</h1>
            <p>Banadero Water and Sanitation Association</p>
        </div>
        
        <div class="content">
            <h2>Dear ${billData.consumerName},</h2>
            <p>Your water bill for <strong>${billData.billingMonth}</strong> is ready. Please find the details below:</p>
            
            <div class="bill-info">
                <h3>📋 Bill Details</h3>
                <div class="info-row">
                    <span class="info-label">Water Meter Number:</span>
                    <span class="info-value">${billData.waterMeterNo}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Billing Period:</span>
                    <span class="info-value">${billData.billingMonth}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Previous Reading:</span>
                    <span class="info-value">${billData.previousReading.toFixed(2)} cu.m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Present Reading:</span>
                    <span class="info-value">${billData.presentReading.toFixed(2)} cu.m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Consumption:</span>
                    <span class="info-value">${billData.consumption.toFixed(2)} cu.m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Status:</span>
                    <span class="info-value">
                        <span class="status-badge status-${billData.paymentStatus}">${billData.paymentStatus}</span>
                    </span>
                </div>
                ${billData.address ? `
                <div class="info-row">
                    <span class="info-label">Service Address:</span>
                    <span class="info-value">${billData.address}</span>
                </div>
                ` : ''}
                ${billData.phone ? `
                <div class="info-row">
                    <span class="info-label">Contact Number:</span>
                    <span class="info-value">${billData.phone}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="amount-highlight">
                <p class="amount">${formatCurrency(billData.amountCurrentBilling)}</p>
                <p class="label">Total Amount Due</p>
            </div>
            
            <div class="due-date">
                <p class="date">${formatDate(billData.dueDate)}</p>
                <p class="label">Payment Due Date</p>
            </div>
            
            <div style="margin-top: 30px;">
                <h3>💳 Payment Instructions</h3>
                <p>Please ensure your payment is made before the due date to avoid any service interruptions. You can pay through:</p>
                <ul>
                    <li>BAWASA Office during business hours</li>
                    <li>Authorized payment centers</li>
                    <li>Online payment platforms (if available)</li>
                </ul>
            </div>
            
            <div style="margin-top: 30px;">
                <h3>📞 Need Help?</h3>
                <p>If you have any questions about this bill or need assistance, please contact our customer service team.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Banadero Water and Sanitation Association (BAWASA)</strong></p>
            <p>Thank you for choosing BAWASA for your water needs!</p>
            <p style="font-size: 12px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * Send welcome email to new consumer
   */
  static async sendWelcomeEmail(consumerData: {
    name: string
    email: string
    waterMeterNo: string
    password: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not configured')
        return { success: false, error: 'Email service not configured' }
      }

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BAWASA</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .credentials {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Welcome to BAWASA!</h1>
            <p>Banadero Water and Sanitation Association</p>
        </div>
        
        <div class="content">
            <h2>Dear ${consumerData.name},</h2>
            <p>Welcome to BAWASA! Your water service account has been successfully created.</p>
            
            <div class="credentials">
                <h3>🔑 Your Account Details</h3>
                <p><strong>Email:</strong> ${consumerData.email}</p>
                <p><strong>Water Meter Number:</strong> ${consumerData.waterMeterNo}</p>
                <p><strong>Temporary Password:</strong> ${consumerData.password}</p>
            </div>
            
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            
            <p>You can now access your account to view your bills, payment history, and manage your water service.</p>
        </div>
        
        <div class="footer">
            <p><strong>Banadero Water and Sanitation Association (BAWASA)</strong></p>
            <p>Thank you for choosing BAWASA!</p>
        </div>
    </div>
</body>
</html>
      `
      
      const { data, error } = await resend.emails.send({
        from: 'BAWASA System <noreply@bawasa-system.com>',
        to: [consumerData.email],
        subject: `Welcome to BAWASA - Account Created | Meter: ${consumerData.waterMeterNo}`,
        html: emailHtml,
      })

      if (error) {
        console.error('❌ Error sending welcome email:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Welcome email sent successfully:', data?.id)
      return { success: true }

    } catch (error) {
      console.error('💥 Unexpected error sending welcome email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}
