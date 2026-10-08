import DefaultLayout from "interface/DefaultLayout";
import { Banner } from "@primer/react";

export default function confirmRegisterPage() {
    return (
        <DefaultLayout
            contentWidth="small"
            metadata={{
                title: "Confirme seu email"
            }}
        >
            <Banner 
                variant="warning"
                title="Falta confirmar o email"
                description="Abra o email que foi enviado pelo Clone FinTab e clique no link de validação" 
            />
        </DefaultLayout>
    )
}