import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <Database />
      <UpdartedAt />
    </>
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

  return <div>Ultima atulizacao : {UpdartedAtText}</div>;
}

function Database() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  let databaseStatus = "Loading...";

  if (!isLoading && data) {
    databaseStatus = data.dependencies.database.version ? "Online" : "Offline";
  }

  return (
    <>
      <div>Database status: {databaseStatus}</div>

      <h1>Database</h1>
      <div>Version: {data.dependencies.database.version}</div>
      <div>Max connections: {data.dependencies.database.max_connections}</div>
      <div>
        Opened connections: {data.dependencies.database.opened_connections}
      </div>
    </>
  );
}
