const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      //wait(1);
      return;
    }

    console.log("\nPostgres está rodando.");
  }
}

process.stdout.write("\n\nAguardando postgres aceitar conexoes");
checkPostgres();
