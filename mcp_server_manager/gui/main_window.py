from PyQt5.QtWidgets import QMainWindow, QVBoxLayout, QHBoxLayout, QWidget, QPushButton, QRadioButton, QButtonGroup
from PyQt5.QtCore import Qt
from .add_server_dialog import AddServerDialog

class MainWindow(QMainWindow):
    def __init__(self, server_manager):
        super().__init__()
        self.server_manager = server_manager
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("MCP Server Manager")
        self.setGeometry(100, 100, 400, 300)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QVBoxLayout()
        central_widget.setLayout(main_layout)

        self.server_group = QButtonGroup(self)
        self.server_buttons = []

        for server in self.server_manager.get_servers():
            radio_button = QRadioButton(server.name)
            self.server_buttons.append(radio_button)
            self.server_group.addButton(radio_button)
            main_layout.addWidget(radio_button)

        button_layout = QHBoxLayout()
        self.start_button = QPushButton("Start")
        self.stop_button = QPushButton("Stop")
        self.add_server_button = QPushButton("Add New Server")

        button_layout.addWidget(self.start_button)
        button_layout.addWidget(self.stop_button)
        button_layout.addWidget(self.add_server_button)

        main_layout.addLayout(button_layout)

        self.start_button.clicked.connect(self.start_server)
        self.stop_button.clicked.connect(self.stop_server)
        self.add_server_button.clicked.connect(self.add_new_server)

    def start_server(self):
        selected_button = self.server_group.checkedButton()
        if selected_button:
            server_name = selected_button.text()
            self.server_manager.start_server(server_name)

    def stop_server(self):
        selected_button = self.server_group.checkedButton()
        if selected_button:
            server_name = selected_button.text()
            self.server_manager.stop_server(server_name)

    def add_new_server(self):
        dialog = AddServerDialog(self)
        if dialog.exec_():
            server_data = dialog.get_server_data()
            self.server_manager.add_new_server(server_data)
            self.update_server_list()

    def update_server_list(self):
        # Clear existing buttons
        for button in self.server_buttons:
            self.server_group.removeButton(button)
            button.deleteLater()
        self.server_buttons.clear()

        # Add updated server list
        for server in self.server_manager.get_servers():
            radio_button = QRadioButton(server.name)
            self.server_buttons.append(radio_button)
            self.server_group.addButton(radio_button)
            self.layout().insertWidget(self.layout().count() - 1, radio_button)
