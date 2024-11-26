# Filesystem MCP Server

Node.js server implementing Model Context Protocol (MCP) for filesystem operations.

## Features


## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start -- /path/to/allowed/directory [/path/to/another/allowed/directory ...]
   ```

   Or use the provided start script:
   ```
   ./start.sh /path/to/allowed/directory [/path/to/another/allowed/directory ...]
   ```

**Note**: The server will only allow operations within directories specified via `args`.

## API

### Resources


### Tools

  - Read complete contents of a file
  - Input: `path` (string)
  - Reads complete file contents with UTF-8 encoding

  - Read multiple files simultaneously
  - Input: `paths` (string[])
  - Failed reads won't stop the entire operation

  - Create new file or overwrite existing (exercise caution with this)
  - Inputs:
    - `path` (string): File location
    - `content` (string): File content

  - Create new directory or ensure it exists
  - Input: `path` (string)
  - Creates parent directories if needed
  - Succeeds silently if directory exists

  - List directory contents with [FILE] or [DIR] prefixes
  - Input: `path` (string)

  - Move or rename files and directories
  - Inputs:
    - `source` (string)
    - `destination` (string)
  - Fails if destination exists

  - Recursively search for files/directories
  - Inputs:
    - `path` (string): Starting directory
    - `pattern` (string): Search pattern
  - Case-insensitive matching
  - Returns full paths to matches

  - Compress a file using specified algorithm
  - Inputs:
    - `path` (string): File to compress
    - `algorithm` (string): 'gzip', 'deflate', or 'brotli'
  - Saves compressed file with appropriate extension

  - Decompress a file using specified algorithm
  - Inputs:
    - `path` (string): File to decompress
    - `algorithm` (string): 'gzip', 'deflate', or 'brotli'
  - Saves decompressed file without compression extension

  - Encrypt a file using AES-256-CBC
  - Inputs:
    - `path` (string): File to encrypt
    - `password` (string): Encryption password
  - Saves encrypted file with .enc extension

  - Decrypt a file encrypted with encrypt_file
  - Inputs:
    - `path` (string): File to decrypt
    - `password` (string): Decryption password
  - Saves decrypted file without .enc extension

  - Compare two text files
  - Inputs:
    - `path1` (string): First file path
    - `path2` (string): Second file path
  - Returns differences in human-readable format

  - Search for a term within a text file
  - Inputs:
    - `path` (string): File to search
    - `searchTerm` (string): Term to search for
  - Returns matching lines with line numbers

  - Generate a hash of a file
  - Inputs:
    - `path` (string): File to hash
    - `algorithm` (string): 'md5', 'sha1', 'sha256', or 'sha512'
  - Returns the hash value

  - Detect the type of a file based on its content
  - Input: `path` (string)
  - Returns the detected MIME type

  - Get detailed file/directory metadata
  - Input: `path` (string)
  - Returns:
    - Size
    - Creation time
    - Modified time
    - Access time
    - Type (file/directory)
    - Permissions

  - List all directories the server is allowed to access
  - No input required
  - Returns:
    - Directories that this server can read/write from

## Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/path/to/other/allowed/dir"
      ]
    }
  }
}
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

