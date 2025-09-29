# MIGRATION SCRIPTS NEEDED

## Required Scripts (Referenced in package.json)

### 1. migrate.js

- **Purpose**: Run database migrations
- **Location**: `backend/src/scripts/migrate.js`
- **Functionality**:
  - Connect to database
  - Run SQL schema creation
  - Handle migration versioning
  - Log migration results

### 2. seed.js

- **Purpose**: Populate database with initial data
- **Location**: `backend/src/scripts/seed.js`
- **Functionality**:
  - Create default admin user
  - Insert reference data
  - Create test users for development
  - Populate tax slabs and validation rules

### 3. reset.js

- **Purpose**: Reset database to clean state
- **Location**: `backend/src/scripts/reset.js`
- **Functionality**:
  - Drop all tables
  - Recreate schema
  - Run seed data
  - Useful for development

## Database Connection Requirements

- Use existing `backend/src/config/database.js`
- Handle connection errors gracefully
- Log all operations
- Support both development and production environments

## Migration Strategy

1. **Initial Migration**: Create all core tables
2. **Data Migration**: Seed initial data
3. **Index Migration**: Create performance indexes
4. **Constraint Migration**: Add data integrity constraints
5. **Trigger Migration**: Add update triggers

## Error Handling

- Validate database connection before operations
- Rollback on errors
- Log detailed error messages
- Exit with appropriate codes

## Environment Support

- Development: Local PostgreSQL
- Production: Production database
- Test: Test database
- Use environment variables for configuration
