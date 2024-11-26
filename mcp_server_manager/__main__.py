import sys
from PyQt5.QtWidgets import QApplication
from mcp_server_manager.gui.main_window import MainWindow
from mcp_server_manager.core.config_manager import ConfigManager
from mcp_server_manager.core.server_manager import ServerManager
from mcp_server_manager.core.file_manager import FileManager

def main():
    app = QApplication(sys.argv)
    
    config_manager = ConfigManager()
    file_manager = FileManager()
    server_manager = ServerManager(config_manager, file_manager)
    
    main_window = MainWindow(server_manager)
    main_window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
