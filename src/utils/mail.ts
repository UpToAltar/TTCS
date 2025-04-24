import nodemailer from 'nodemailer'
const regexCheckEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const sendVerificationEmail = async (email: string, token: string, subject?: string, html?: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject ? subject : 'Xác nhận tài khoản',
    html: html ? html : `
      <p>
        ※Mail này được gửi cho người dùng đã thực hiện thủ tục đăng ký người dùng tại 
        <strong>'Ứng dụng đặt lịch khám Youmed'</strong> để thông báo bạn đã hoàn thành quá trình tiếp nhận đăng ký tạm thời. 
        Thủ tục đăng ký vẫn chưa hoàn thành, bạn hãy thực hiện xác thực đăng ký thật theo hướng dẫn trong mail.
      </p>

      <p>
        Cảm ơn bạn đã đăng ký <strong>'Ứng dụng đặt lịch khám Youmed'</strong>.<br>
        Chúng tôi đã tiếp nhận đăng ký tạm thời của bạn.
      </p>

      <p>
        Thủ tục đăng ký người dùng của bạn chưa hoàn thành, để chứng minh thông tin người đăng ký, 
        bạn hãy nhấn vào nút bên dưới để hoàn tất xác thực tài khoản.
      </p>

      <p style="text-align: center;">
        <a href="${verificationLink}" style="
          display: inline-block;
          padding: 6px 12px;
          background-color: #3ac7e3;
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 6px;
          font-size: 10px;
        ">
          Xác nhận tài khoản
        </a>
      </p>

      <p>
        ※Nếu bạn không phải là người đăng ký tài khoản ở hệ thống của chúng tôi, vui lòng hãy xoá mail này.
        <br><br>
        ※Mail này được gửi tự động bởi hệ thống, có hiện lực trong 15 phút.
      </p>
    `
  }

  await transporter.sendMail(mailOptions)
}
export const sendVerificationBookingEmail = async (email: string, token: string, subject?: string, html?: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`
  // const verificationLink = `${process.env.CLIENT_URL}/verify-email.html?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject ? subject : 'Xác nhận lịch khám',
    html: html ? html : `
      <p>
        ※Mail này được gửi đến bạn từ <strong>'Ứng dụng đặt lịch khám Youmed'</strong> nhằm xác nhận lịch hẹn khám bệnh bạn đã đặt.
      </p>

      <p>
        Cảm ơn bạn đã sử dụng <strong>'Ứng dụng đặt lịch khám Youmed'</strong>.<br>
        Chúng tôi đã tiếp nhận thông tin đặt lịch của bạn.
      </p>

      <p>
        Vui lòng nhấn vào nút bên dưới để xác nhận lịch hẹn khám của bạn.
      </p>

      <p style="text-align: center;">
        <a href="${verificationLink}" style="
          display: inline-block;
          padding: 6px 12px;
          background-color: #3ac7e3;
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 6px;
          font-size: 10px;
        ">
          Xác nhận lịch khám
        </a>
      </p>

      <p>
        ※Nếu bạn không phải là người thực hiện việc đặt lịch, vui lòng bỏ qua mail này hoặc xoá nó.
        <br><br>
        ※Mail này được gửi tự động bởi hệ thống, có hiện lực trong 15 phút.
      </p>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const sendVerificationCancelBookingEmail = async (email: string, token: string, subject?: string, html?: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject ? subject : 'Xác nhận hủy lịch khám',
    html: html ? html : `
      <p>
        ※Mail này được gửi từ <strong>'Ứng dụng đặt lịch khám Youmed'</strong> để xác nhận yêu cầu hủy lịch hẹn khám của bạn.
      </p>

      <p>
        Nếu bạn thật sự muốn hủy lịch hẹn khám đã đặt trước, vui lòng nhấn vào nút bên dưới để xác nhận.
      </p>

      <p style="text-align: center;">
        <a href="${verificationLink}" style="
          display: inline-block;
          padding: 6px 12px;
          background-color: #ff4d4f;
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 6px;
          font-size: 10px;
        ">
          Hủy lịch khám
        </a>
      </p>

      <p>
        ※Nếu bạn không thực hiện yêu cầu hủy lịch, vui lòng bỏ qua mail này.<br><br>
        ※Mail này được gửi tự động bởi hệ thống, có hiện lực trong 15 phút.
      </p>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const validateEmail = (input: string) => {
  if (input) return regexCheckEmail.test(input)
  else return false
}
