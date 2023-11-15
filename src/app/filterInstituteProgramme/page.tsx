'use client'
import { Label, RangeSlider, TextInput } from 'flowbite-react'
import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'


export default function FilterInstituteProgramme() {
  const [value, setValue] = React.useState<number[]>([6000, 30000])

  //setValue([6000, 30000]) - set an array containing 2 number
  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[])
  };

  //put ... to ensure that not directly modifying the state array
  const handleInputChange = (index: number, inputValue: string) => {
    const updatedValue = [...value]
    //value[0] = new input, value[1] = new input
    updatedValue[index] = parseInt(inputValue)
    setValue(updatedValue)
  };

  return (
    <div className={"flex min-h-screen "}>
      <div className="flex-1 flex flex-col p-10 m-6 bg-slate-100" style={{ flex: '35%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "20px" }}>
          <h1 style={{ color: "black", fontSize: "20px" }}>Filter</h1>
          <h1 style={{ color: "black", fontSize: "20px" }}>Reset</h1>
        </div>

        <div>
          <Label htmlFor="name" value="Price Range" style={{ fontSize: "16px", marginBottom: "5px" }} />

          <div>
            <Box sx={{ width: 300 }}>
              <Slider
                min={0}
                max={50000}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
              />

              <div style={{ display: 'flex', marginBottom: "20px" }}>

                <div style={{ marginRight: "10px" }}>
                  <Label htmlFor="minimumPrice" value="Minimum Price" />
                  <TextInput
                    type="number"
                    className="form-control"
                    id="name"
                    value={value[0]}
                    onChange={(e) => handleInputChange(0, e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="maximumPrice" value="Maximum Price" />
                  <TextInput
                    type="number"
                    className="form-control"
                    id="name"
                    value={value[1]}
                    onChange={(e) => handleInputChange(1, e.target.value)}
                  />
                </div>
              </div>
            </Box>
          </div>
        </div>

        <div>
          <div style={{ paddingBottom: '20px' }}>
            <Label htmlFor="minimumPrice" value="Minimum Price" />

          </div>
        </div>

      </div>
      <div className="flex-1 p-10 m-6 bg-slate-100" style={{ flex: '65%' }}>
        <h1>Right Block</h1>
      </div>
    </div>
  )

}
