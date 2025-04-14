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
  let databaseVersion = "Loading...";
  let maxConnections = "Loading...";
  let openedConnections = "Loading...";

  if (!isLoading && data) {
    databaseStatus = data.dependencies.database.version ? "Online" : "Offline";
    databaseVersion = data.dependencies.database.version;
    maxConnections = data.dependencies.database.maxConnections;
    openedConnections = data.dependencies.database.openedConnections;
  }

  return (
    <>
      <div>Database status: {databaseStatus}</div>
      <h1>Database</h1>
      <div>Version: {databaseVersion}</div>
      <div>Max connections: {maxConnections}</div>
      <div>Opened connections: {openedConnections}</div>
    </>
  );
}
