"use client"
import TextareaAutosizeProps  from "react-textarea-autosize";

export default function chat() {

    
    return (
        <div className="flex flex-col pl-1 p-4 min-h-screen relative">
            <div className="flex sm:pl-6 xl:pl-16 absolute bottom-3 w-full">
            <TextareaAutosizeProps
            rows={2}
            maxRows={4}
            autoFocus
            placeholder="Write something here!"
            className="peer disabled:opacity-50 resize-none block border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6 w-11/12 rounded" />
</div>
        </div>
    )
}