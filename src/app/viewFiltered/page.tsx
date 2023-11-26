'use client'
import { useSearchParams } from "next/navigation"

export default function view() {
  const searchParams = useSearchParams()
  const data = searchParams.get('search')
  console.log(data)

  return (
    <div>
      <p>Okkaaa</p>
    </div>
  )
}
