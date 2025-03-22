#!/bin/bash

# Set the role name
ROLE_NAME="uc6gmj6dv17fmc"

# Create the role with CREATEDB privilege
echo "Creating role $ROLE_NAME with CREATEDB privilege..."
psql -U postgres -c "CREATE ROLE $ROLE_NAME WITH LOGIN CREATEDB;"

# Grant the role pg_read_all_data
echo "Granting pg_read_all_data role to $ROLE_NAME..."
psql -U postgres -c "GRANT pg_read_all_data TO $ROLE_NAME;"

echo "Role $ROLE_NAME created with CREATEDB privilege and granted necessary privileges."