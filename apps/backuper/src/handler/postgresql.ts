import { createWriteStream, unlinkSync } from "fs";
import { BackupHandlerProps, DatabaseHandler } from ".";
import { zipFiles } from "../archiver/zip";
import { spawn } from "child_process";
import which from "which";

export const postgresqlHandler = (): DatabaseHandler => {
  return {
    backup: async (props: BackupHandlerProps) => {
      if (!props.postgresql) {
        throw new Error(
          "PostgreSQL configuration is required for PostgreSQL backup"
        );
      }

      // run pg_dump to dump the database to a temporary directory before zipping it
      // run via a child process
      const dumpFilePath = `tmp/${new Date().toISOString()}.sql`;

      const { host, port, username, password, database } = props.postgresql;

      await (async () => {
        return new Promise<string>((resolve, reject) => {
          const cmd = which.sync("pg_dump");
          const args = [
            "-h",
            host,
            "-p",
            port.toString(),
            "-U",
            username,
            "-d",
            database,
          ];

          const env = { PGPASSWORD: password };

          const dumpProcess = spawn(cmd, args, { env });
          const writeStream = createWriteStream(dumpFilePath);

          dumpProcess.stdout.pipe(writeStream);

          dumpProcess.on("error", (err) => {
            reject(err);
          });

          dumpProcess.on("close", (code) => {
            if (code === 0) {
              resolve(dumpFilePath);
            } else {
              reject(new Error(`pg_dump exited with code ${code}`));
            }
          });

          dumpProcess.stderr.on("data", (data) => {
            console.error(`pg_dump error: ${data}`);
          });
        });
      })();

      const zipPath = await zipFiles(
        [
          {
            name: `${database}.sql`,
            path: dumpFilePath,
          },
        ],
        `zip-${new Date().toISOString()}.zip`
      );

      // remove the temporary dump file
      unlinkSync(dumpFilePath);

      return {
        path: zipPath,
      };
    },
  };
};
