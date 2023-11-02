"use client"
import ReactTextareaAutosize from "react-textarea-autosize";
import { TextareaAutosizeProps } from "react-textarea-autosize";

export default function Home() {

    
    return (
        <div className="flex flex-col items-center justify-between p-24">
            <ReactTextareaAutosize
            rows={2}
            maxRows={4}
            autoFocus
            placeholder="Write something here!"
            className="" //continue 32.22
        </div>
    )
}