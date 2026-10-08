import useSWR from "swr";
import DefaultLayout from "interface/DefaultLayout";
import { Banner, Stack, Heading } from "@primer/react";
import { Card } from "@primer/react/experimental";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <DefaultLayout
      contentWidth="medium"
      metadata={{
        title: "Status",
        description: "Status",
      }}
    >
      <Stack gap="spacious">
        <Heading as="h1">Status</Heading>
        <UpdartedAt />
        <Database />
      </Stack>
    </DefaultLayout>
  );
}

function UpdartedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  let UpdartedAtText = "Loading...";

  if (!isLoading && data) {
    UpdartedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return (
    <Banner variant="info" layout="com">
      <Banner.Title>Ultima atulizacao : {UpdartedAtText}</Banner.Title>
    </Banner>
  );
}

function Database() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 20000,
  });

  if (isLoading || !data) {
    return;
  }

  const database = data.dependencies.database;
  const maxConnections = database.max_connections;
  const openedConnections = database.opened_connections;
  const databaseVersion = database.version ?? "-";

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        Database
      </Heading>
      <Stack direction={{ narrow: "vertical", regular: "horizontal" }}>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões Abertas</Card.Heading>
            <Card.Description>{openedConnections}</Card.Description>
            <Card.Metadata>Uso neste instante</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões Máximas</Card.Heading>
            <Card.Description>{maxConnections}</Card.Description>
            <Card.Metadata>Conexões disponiveis</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>PostgreSQL</Card.Heading>
            <Card.Description>{databaseVersion}</Card.Description>
            <Card.Metadata>Versão em execução</Card.Metadata>
          </Card>
        </Stack.Item>
      </Stack>
    </Stack>
  );
}
