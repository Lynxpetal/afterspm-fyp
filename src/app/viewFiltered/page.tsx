'use client'
import { useSearchParams } from "next/navigation"
import { Table } from 'flowbite-react'

export default function view() {
  const searchParams = useSearchParams()
  const data = searchParams.get('search')
  console.log(data)

  return (
    <div className="card" style={{ margin: '30px' }}>
      <div style={{ overflowX: 'auto' }}>
        <Table striped style={{fontFamily: "Arial, Helvetica, sans-serif", fontWeight: "bold"}}>
          <Table.Body>
            <Table.Row style={{backgroundColor: '#FFFFFF'}}>
              <Table.Cell style={{ width: '20%', fontSize: "15px" }}></Table.Cell>
            </Table.Row>
            <Table.Row style={{backgroundColor: '#8DD3E2'}}>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Programme Name</Table.Cell>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Programme Name</Table.Cell>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Programme Name</Table.Cell>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Programme Name</Table.Cell>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Programme Name</Table.Cell>
            </Table.Row>
            <Table.Row style={{backgroundColor: '#E9FFFB'}}>
              <Table.Cell style={{ width: '20%', backgroundColor: '#E9FFFB', fontSize: "15px" }}>Campus</Table.Cell>
            </Table.Row>
            <Table.Row style={{backgroundColor: '#8DD3E2'}}>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Programme Duration</Table.Cell>
            </Table.Row> 
            <Table.Row style={{backgroundColor: '#E9FFFB'}}>
              <Table.Cell style={{ width: '20%', backgroundColor: '#E9FFFB', fontSize: "15px" }}>Programme Estimated Price</Table.Cell>
            </Table.Row>
            <Table.Row style={{backgroundColor: '#8DD3E2'}}>
              <Table.Cell style={{ width: '20%', backgroundColor: '#8DD3E2', fontSize: "15px" }}>Driving Duration</Table.Cell>
            </Table.Row>
            <Table.Row style={{backgroundColor: '#E9FFFB'}}>
              <Table.Cell style={{ width: '20%', backgroundColor: '#E9FFFB', fontSize: "15px" }}>Minimum Entry Requirements</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>

    </div>
  )
}
