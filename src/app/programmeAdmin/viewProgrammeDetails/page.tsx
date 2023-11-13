'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react';

export default function ViewProgrammeDetails() {
  //retrieve the id
  const searchParams = useSearchParams();
  const instituteId = searchParams.get('search')
  console.log(instituteId)

  //fetch the single document
  const [isProgrammeFetchDataLoading, setIsProgrammeFetchDataLoading] = useState(false)
  const [programme, setProgramme] = useState({})
  const [programmeName, setProgrammeName] = useState('')
  const [instituteName, setInstituteName] = useState('')
  const [programmeDuration, setProgrammeDuration] = useState('')
}