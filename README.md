# Databases Auto Backup Tool

A lightweight, automated backup solution designed to securely copy your PostgreSQL databases and local directories to any S3-compatible storage (e.g., AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces) on a defined schedule.

## Features

- **Automated Scheduling:** Define your backup frequency using standard cron schedule expressions.
- **Multiple Targets:** Built-in support for backing up both PostgreSQL databases and local directories.
- **S3 Compatible Storage:** Seamlessly upload compressed backups to any S3-compatible bucket.
- **Hot-Reload:** Automatically detects changes in your `config.yaml` file. No container restart is required when adjusting your schedules or adding plans.
- **History Retention:** Automatically retain a maximum number of backups per plan (`max_backups`) and clean up old ones.
- **Containerized for Easy Deployment:** Ships with `pg_dump` and `pg_isready` built-in inside a lightweight Docker image. No need to install PostgreSQL clients on your host machine.

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation & Deployment

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mimamch/backuper.git
   cd backuper/apps/backuper
   ```

2. **Prepare your configuration:**
   Copy the example configuration file and adapt it to your credentials.

   ```bash
   cp config.example.yaml config.yaml
   ```

3. **Start the service:**
   Run the application in the background using Docker Compose.
   ```bash
   docker compose up -d
   ```

## Configuration (`config.yaml`)

The `config.yaml` file stores the credentials to your central storage backend and delineates all your backup "plans."

### Storage Block

Provide the credentials for your chosen S3-compatible service.

```yaml
storage:
  s3:
    access_key: "your_s3_access_key"
    secret_key: "your_s3_secret_key"
    endpoint: "https://s3.your-region.amazonaws.com"
    bucket: "your-backup-bucket"
```

### Plans Block

You can define multiple backup plans, which will run independently side-by-side.

#### 1. PostgreSQL Backup Plan

```yaml
plans:
  - name: production-postgres
    active: true
    schedule: "0 2 * * *" # Runs every day at 2:00 AM
    max_backups: 5 # Keeps the 5 most recent backups, deletes older ones
    type: postgresql
    postgresql:
      host: db-host-or-ip
      port: 5432
      username: postgres
      password: your-password
      database: my_app_db
```

#### 2. Directory Backup Plan

_Note for Docker Users: Make sure to map/mount the directory you want to back up into the Docker container via `volumes` in your `docker-compose.yaml` file so the app can access it._

```yaml
plans:
  - name: application-assets
    active: true
    schedule: "0 3 * * 0" # Runs every Sunday at 3:00 AM
    max_backups: 3
    type: dir
    dir:
      path: "/app/to-backup/assets" # Path to the mapped folder inside the container
```

## Logs and Audits

The system manages local status logs regarding backup success, errors, size metrics, and file locations in the `./logs` directory natively mounted by Docker Compose (`./logs:/app/logs`).

## Contributing

Contributions, issues, and feature requests are very welcome! If you'd like to extend the tool (e.g., adding MySQL, Redis, or local storage support):

1. Ensure you have **Node.js** installed on your machine.
2. Install dependencies: `npm install` (or you can use `pnpm`).
3. Create a new handler logic inside `src/handler/` that implements the `DatabaseHandler` type.
4. Run locally in watch mode to test: `npm run dev`

Submit a Pull Request whenever you are ready!
