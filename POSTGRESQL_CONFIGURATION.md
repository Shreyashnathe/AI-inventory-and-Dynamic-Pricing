# StockPulse - PostgreSQL Configuration

This document explains how to configure and run StockPulse with PostgreSQL database.

## Database Configuration

The application is configured to use PostgreSQL with the following settings:

- **Database Name**: `StockPulse`
- **Username**: `postgres`
- **Password**: Configured via `DB_PASSWORD` in `.env`
- **Host**: `localhost`
- **Port**: `5432`

These settings are configured in `.env` (or `application.properties`).

## Prerequisites

1. **PostgreSQL Server** must be installed and running on your system
2. **Database Creation**: The `StockPulse` database must exist
3. **User Permissions**: The `postgres` user must have access to the database
4. **Environment File**: Copy `.env.example` to `.env` and set your `DB_PASSWORD`

## Setting Up PostgreSQL

### 1. Install PostgreSQL
If you haven't already installed PostgreSQL, download and install it from:
- Windows: https://www.postgresql.org/download/windows/
- macOS: https://www.postgresql.org/download/macosx/
- Linux: https://www.postgresql.org/download/linux/

### 2. Create the Database
Connect to PostgreSQL and create the required database:

```sql
CREATE DATABASE "StockPulse";
```

### 3. Verify Credentials
Ensure the `postgres` user password matches your `DB_PASSWORD` set in `.env`.

## Running the Application

### Using Maven Wrapper (Recommended)
```bash
cd backend
./mvnw spring-boot:run
```

### Using Maven
```bash
cd backend
mvn spring-boot:run
```

### Using Java (after packaging)
```bash
cd backend
mvn package
java -jar target/stockpulse-backend-0.0.1-SNAPSHOT.jar
```

## Connection Pool Settings

The application is configured with optimized connection pool settings for PostgreSQL:
- Maximum pool size: 20 connections
- Minimum idle connections: 5
- Connection timeout: 20 seconds
- Idle timeout: 5 minutes
- Maximum lifetime: 20 minutes

## Troubleshooting

### Common Issues

1. **Connection Refused**: 
   - Ensure PostgreSQL is running
   - Check that PostgreSQL is listening on port 5432
   - Verify firewall settings

2. **Authentication Failed**:
   - Check username and password in application.properties
   - Verify pg_hba.conf allows connections

3. **Database Does Not Exist**:
   - Create the "StockPulse" database using the SQL command above

4. **Driver Not Found**:
   - The PostgreSQL driver is already included in pom.xml
   - Run `mvn clean install` to ensure dependencies are downloaded

### Verifying the Connection

Once the application is running, you can verify the database connection by:
1. Checking the application logs for successful database connection messages
2. Accessing the API endpoints that interact with the database
3. Using a database client to connect directly to the StockPulse database

## Schema Management

The application uses Hibernate's `ddl-auto=update` setting, which will:
- Automatically create tables on first startup
- Update schema when entity definitions change
- Preserve existing data

For production environments, consider using migration tools like Flyway or Liquibase instead.