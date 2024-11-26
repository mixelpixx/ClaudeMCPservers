# SQLite MCP Server

## Overview
A Model Context Protocol (MCP) server implementation that provides database interaction and business intelligence capabilities through SQLite. This server enables running SQL queries, analyzing business data, and automatically generating business insight memos. It now includes enhanced functionality for schema visualization, query explanation, and transaction management.

## Components

### Resources
The server exposes a single dynamic resource:
  - Auto-updates as new insights are discovered via the append-insight tool
  - Optional enhancement through Claude for professional formatting (requires Anthropic API key)

### Prompts
The server provides a demonstration prompt:
  - Required argument: `topic` - The business domain to analyze
  - Generates appropriate database schemas and sample data
  - Guides users through analysis and insight generation
  - Integrates with the business insights memo

### Tools
The server offers six core tools:

#### Query Tools
   - Execute SELECT queries to read data from the database
   - Input: 
     - `query` (string): The SELECT SQL query to execute
   - Returns: Query results as array of objects

   - Execute INSERT, UPDATE, or DELETE queries to modify data in the database
   - Input:
     - `query` (string): The SQL modification query
   - Returns: `{ affected_rows: number }`

   - Create new tables in the database
   - Input:
     - `query` (string): CREATE TABLE SQL statement specifying table name, columns, and their data types
   - Returns: Confirmation of table creation

#### Schema Tools
   - Get a list of all tables in the database
   - No input required
   - Returns: Array of table names

   - View schema information for a specific table
   - Input:
     - `table_name` (string): Name of table to describe
   - Returns: Array of column definitions with names and types

#### Analysis Tools
   - Add new business insights to the memo resource
   - Input:
     - `insight` (string): Business insight discovered from data analysis
   - Returns: Confirmation of insight addition
   - Triggers update of memo://insights resource

#### New Tools
   - Generate a visual representation of the database schema
   - No input required
   - Returns: Image of database schema showing tables and relationships

   - Provide a detailed explanation of a given SQL query
   - Input:
     - `query` (string): SQL query to explain
   - Returns: Detailed explanation of query execution plan

   - Retrieve a random sample of data from a specified table
   - Input:
     - `table_name` (string): Name of table to sample
     - `sample_size` (integer): Number of rows to sample
   - Returns: Array of sampled data rows

   - Get detailed information about the last error that occurred
   - No input required
   - Returns: Detailed error information

   - Manage database transactions
   - No input required
   - Returns: Confirmation of transaction action

## Usage with Claude Desktop
