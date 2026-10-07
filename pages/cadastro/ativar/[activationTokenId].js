import { useState, useEffect } from "react";
import { Button } from "@primer/react";
import {useRouter} from "next/router";

export default function ActivateUserPage(){
    const router = useRouter();
    const activationTokenId = router.query.activationTokenId;
    

    useEffect(() => {
        if (!activationTokenId) {
            return;
        }

        sendActivationRequest();

        async function sendActivationRequest() {
            
        }
    })
}