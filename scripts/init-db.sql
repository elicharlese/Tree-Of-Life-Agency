-- Tree of Life Agency - Database Initialization Script
-- Following Windsurf Global Rules for database setup

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS treeoflife_dev;
CREATE DATABASE IF NOT EXISTS treeoflife_test;
CREATE DATABASE IF NOT EXISTS treeoflife_prod;

-- Create users for different environments
CREATE USER IF NOT EXISTS 'tola_dev'@'%' IDENTIFIED BY 'dev_password';
CREATE USER IF NOT EXISTS 'tola_test'@'%' IDENTIFIED BY 'test_password';
CREATE USER IF NOT EXISTS 'tola_prod'@'%' IDENTIFIED BY 'prod_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON treeoflife_dev.* TO 'tola_dev'@'%';
GRANT ALL PRIVILEGES ON treeoflife_test.* TO 'tola_test'@'%';
GRANT ALL PRIVILEGES ON treeoflife_prod.* TO 'tola_prod'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use development database
USE treeoflife_dev;

-- Create initial admin user (will be handled by Prisma migrations)
-- This is just a placeholder for any custom initialization logic
