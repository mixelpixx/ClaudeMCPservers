import os
import shutil
from mcp_server_manager.utils.constants import MCP_SERVERS_FOLDER

class FileManager:
    def __init__(self):
        self.mcp_servers_folder = MCP_SERVERS_FOLDER
        os.makedirs(self.mcp_servers_folder, exist_ok=True)

    def create_server_folder(self, server_name):
        server_folder = os.path.join(self.mcp_servers_folder, server_name)
        os.makedirs(server_folder, exist_ok=True)
        return server_folder

    def copy_server_files(self, source_folder, server_name):
        destination_folder = self.create_server_folder(server_name)
        for item in os.listdir(source_folder):
            s = os.path.join(source_folder, item)
            d = os.path.join(destination_folder, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, symlinks=False, ignore=None)
            else:
                shutil.copy2(s, d)
