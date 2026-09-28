# StockPulse - Database Migration to PostgreSQL

This document outlines the migration from H2 in-memory database to PostgreSQL for the StockPulse application.

## Migration Summary

The StockPulse application has been configured to use PostgreSQL as its primary database instead of the default H2 in-memory database. This change provides:

1. **Persistence**: Data now persists between application restarts
2. **Production Readiness**: PostgreSQL is a production-grade database
3. **Scalability**: Better performance characteristics for larger datasets
4. **Tooling**: Access to PostgreSQL administration tools

## Configuration Changes

### Previous Configuration (H2)
```properties
# H2 In-Memory Database
spring.datasource.url=jdbc:h2:mem:stockpulse;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

### New Configuration (PostgreSQL)
```properties
# PostgreSQL Database Configuration
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/StockPulse}
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

## Impact on Application

### Positive Impacts
1. **Data Persistence**: No data loss when application restarts
2. **Performance**: Better handling of concurrent connections
3. **Monitoring**: Ability to use PostgreSQL monitoring tools
4. **Backup/Restore**: Standard PostgreSQL backup procedures can be used

### Required Changes
1. **Database Setup**: PostgreSQL server must be installed and running
2. **Database Creation**: The "StockPulse" database must be created
3. **User Permissions**: The configured user must have appropriate permissions

## Database Schema

The application uses Hibernate's automatic schema generation feature (`ddl-auto=update`). This means:

1. **Initial Startup**: Tables are automatically created
2. **Schema Evolution**: As entity definitions change, the schema is updated accordingly
3. **Data Preservation**: Existing data is preserved during schema updates

## Connection Pool Optimization

Additional connection pool settings have been added for optimal PostgreSQL performance:

```properties
# Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
```

## Testing Considerations

1. **Integration Tests**: Updated to work with PostgreSQL
2. **Performance Testing**: PostgreSQL-specific optimizations can be applied
3. **Load Testing**: Better concurrency handling with connection pooling

## Deployment Considerations

1. **Environment Variables**: Database credentials can be moved to environment variables for security
2. **Docker**: PostgreSQL can be containerized alongside the application
3. **Cloud Deployment**: Standard PostgreSQL hosting options (AWS RDS, Google Cloud SQL, etc.)

## Rollback Procedure

If needed, the application can be reverted to H2 by:
1. Updating the `application.properties` file with H2 configuration
2. Removing/adjusting PostgreSQL-specific connection pool settings
3. Ensuring the H2 dependency remains in `pom.xml`

For detailed PostgreSQL setup instructions, refer to the `POSTGRESQL_CONFIGURATION.md` file.