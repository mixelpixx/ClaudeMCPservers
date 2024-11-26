import os

APP_DATA_FOLDER = os.path.join(os.environ['APPDATA'], 'Claude')
MCP_SERVERS_FOLDER = os.path.join(APP_DATA_FOLDER, 'MCPServers')
CONFIG_FILE_PATH = os.path.join(APP_DATA_FOLDER, 'CONFIG.JSON')
