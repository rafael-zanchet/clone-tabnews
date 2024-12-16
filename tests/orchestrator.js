import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      //const responseBody = await response.json();
      if (response.status !== 200) {
        console.log(response.status);
        throw Error();
      }
    }
  }
}

export default { waitForAllServices };
