"use client"

import { nanoid } from "nanoid";
import { FC, HTMLAttributes, useContext, useRef, useState } from "react";
import { Spinner, Toast } from "flowbite-react";
import PsychForm from "@/app/component/PsychForms";
import holland from "@/json/hollands.json";

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> { }

// CSN1	I am always prepared.
// CSN2	I leave my belongings around.
// CSN3	I pay attention to details.
// CSN4	I make a mess of things.
// CSN5	I get chores done right away.
// CSN6	I often forget to put things back in their proper place.
// CSN7	I like order.
// CSN8	I shirk my duties.
// CSN9	I follow a schedule.
// CSN10	I am exacting in my work.
// OPN1	I have a rich vocabulary.
// OPN2	I have difficulty understanding abstract ideas.
// OPN3	I have a vivid imagination.
// OPN4	I am not interested in abstract ideas.
// OPN5	I have excellent ideas.
// OPN6	I do not have a good imagination.
// OPN7	I am quick to understand things.
// OPN8	I use difficult words.
// OPN9	I spend time reflecting on things.
// OPN10	I am full of ideas.
const ChatInput: FC<ChatInputProps> = ({ }) => {
    function init() {
        let holland = [{
            labels: "I am the life of the party.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I don't feel nervous when speaking to crowds",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I feel comfortable around people.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I hate being in the background.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I start conversations.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I talk a lot.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I talk to a lot of different people at parties.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I like to standout from the crownd.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I don't mind being the center of attention.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I don't mind if there are strangers.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EXT",
        },
        {
            labels: "I get stressed out easily.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I feel tense most of the time.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I worry about things.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I enjoy emotional moments.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I am easily disturbed.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I get upset easily.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I change my mood a lot.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I have frequent mood swings.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I get irritated easily.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I often feel blue.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "EST",
        },
        {
            labels: "I feel little concern for others.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I am interested in people.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I insult people.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I sympathize with others' feelings.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I am not interested in other people's problems.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I take time out for others.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I feel others' emotions.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I make people feel at ease.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I have a soft heart.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        {
            labels: "I am not interested in other people's problems.",
            options: [1, 2, 3, 4, 5],
            answers: "",
            category: "ARG",
        },
        ]
        
    }
    return (
        <div className={"flex flex-col pl-1 p-4 min-h-screen relative"}>
            <PsychForm Title="Holland's Career" Form={[]} />
        </div>
    )
}

export default ChatInput