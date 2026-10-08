import DefaultLayout from "interface/DefaultLayout";
import { Banner } from "@primer/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ActivateUserPage() {
    const router = useRouter();
    const activationTokenId = router.query.activationTokenId;
    const [activationStatus, setActivationStatus] = useState("loading");
    const [errorMessage, setErrorMessage ] = useState("");

    useEffect(() => {
        if (!activationTokenId){
            return;
        }

        sendActicationRequest();
        
        async function sendActicationRequest(){
            try {
                const response = await fetch(`/api/v1/activations/${activationTokenId}`,{
                    method: "PATCH"
                })

                const activationResponseBody = await response.json();
                
                if (response.status === 200){
                    setActivationStatus("success");
                    
                    return;
                }
                
                setErrorMessage(`${activationResponseBody.message} ${activationResponseBody.action}`);
                setActivationStatus("failure");
            }catch{
                setErrorMessage("Falha de conexão com servidor, tente novamente mais tarde.");
                setActivationStatus("failure");
            }

            
        }

    }, [activationTokenId]);

    return (
        <DefaultLayout
            contentWidth="small"
            metadata={{
                title: "Ativar cadastro"
            }}
        >
            {activationStatus === "loading" && (
                <Banner variant="info">
                    <Banner.Title>Verificando token...</Banner.Title>
                </Banner>
            )}

            {activationStatus === "success" && (
                <Banner variant="success">
                    <Banner.Title>Cadastro ativado com sucesso!</Banner.Title>
                    <Banner.Description>
                        Você já pode fazer login no sistema. 
                        <a href="/login">Clique aqui para ir para a página de login</a>.
                    </Banner.Description>
                </Banner>
            )}


            {activationStatus === "failure" && (
                <Banner variant="critical">
                    <Banner.Title>Falha ao ativar cadastro</Banner.Title>
                    <Banner.Description>
                        {errorMessage}
                    </Banner.Description>
                </Banner>
            )}
        </DefaultLayout>
    )
}