import { BackupHandlerProps, DatabaseHandler } from ".";

export const postgresqlHandler = (): DatabaseHandler => {
  return {
    backup: async (props: BackupHandlerProps) => {
      if (!props.postgresql) {
        throw new Error(
          "PostgreSQL configuration is required for PostgreSQL backup"
        );
      }

      throw new Error("PostgreSQL backup not yet implemented");
    },
  };
};
