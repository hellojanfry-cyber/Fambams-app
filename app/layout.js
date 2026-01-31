import './globals.css'

export const metadata = {
  title: 'FamBams - Family Schedule',
  description: 'Keep your family connected with shared schedules',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}