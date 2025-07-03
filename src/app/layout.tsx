
import './globals.css'
import { Karla } from 'next/font/google'


const karla = Karla({ subsets: ['latin'], weight: ['400', '700'] })

export const metadata = {
  title: 'Discens',
  description: 'Gestión escolar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}){

  return (
    <html lang="es" className={karla.className}>
      <body>
        {children}
      </body>
    </html>
  )
}