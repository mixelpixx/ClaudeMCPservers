import json
import os
from mcp_server_manager.utils.constants import CONFIG_FILE_PATH

class ConfigManager:
    def __init__(self):
        self.config_file = CONFIG_FILE_PATH

    def load_config(self):
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return json.load(f)
        return {"mcpServers": {}}

    def save_config(self, config):
        os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)

    def add_server(self, server):
        config = self.load_config()
        config["mcpServers"][server.name] = {
            "command": server.command,
            "args": server.args,
            "folder": server.folder
        }
        self.save_config(config)
