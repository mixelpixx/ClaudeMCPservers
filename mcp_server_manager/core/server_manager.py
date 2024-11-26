import subprocess
from dataclasses import dataclass

@dataclass
class Server:
    name: str
    command: str
    args: list
    folder: str
    process: subprocess.Popen = None

class ServerManager:
    def __init__(self, config_manager, file_manager):
        self.config_manager = config_manager
        self.file_manager = file_manager
        self.servers = []
        self.load_servers()

    def load_servers(self):
        config = self.config_manager.load_config()
        for server_name, server_data in config.get("mcpServers", {}).items():
            self.servers.append(Server(
                name=server_name,
                command=server_data["command"],
                args=server_data["args"],
                folder=server_data.get("folder", "")
            ))

    def get_servers(self):
        return self.servers

    def start_server(self, server_name):
        server = self.get_server_by_name(server_name)
        if server and not server.process:
            server.process = subprocess.Popen(
                [server.command] + server.args,
                cwd=server.folder,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

    def stop_server(self, server_name):
        server = self.get_server_by_name(server_name)
        if server and server.process:
            server.process.terminate()
            server.process = None

    def add_new_server(self, server_data):
        new_server = Server(
            name=server_data["name"],
            command=server_data["command"],
            args=server_data["args"],
            folder=server_data["folder"]
        )
        self.servers.append(new_server)
        self.config_manager.add_server(new_server)
        self.file_manager.create_server_folder(new_server.name)

    def get_server_by_name(self, server_name):
        return next((server for server in self.servers if server.name == server_name), None)
