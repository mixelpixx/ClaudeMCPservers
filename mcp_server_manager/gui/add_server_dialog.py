from PyQt5.QtWidgets import QDialog, QVBoxLayout, QFormLayout, QLineEdit, QPushButton, QFileDialog, QHBoxLayout

class AddServerDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Add New Server")
        layout = QVBoxLayout(self)

        form_layout = QFormLayout()
        self.name_input = QLineEdit()
        self.command_input = QLineEdit()
        self.args_input = QLineEdit()
        self.folder_input = QLineEdit()

        form_layout.addRow("Server Name:", self.name_input)
        form_layout.addRow("Command:", self.command_input)
        form_layout.addRow("Arguments:", self.args_input)
        form_layout.addRow("Server Folder:", self.folder_input)

        browse_button = QPushButton("Browse")
        browse_button.clicked.connect(self.browse_folder)
        form_layout.addRow("", browse_button)

        layout.addLayout(form_layout)

        buttons_layout = QHBoxLayout()
        ok_button = QPushButton("OK")
        cancel_button = QPushButton("Cancel")
        buttons_layout.addWidget(ok_button)
        buttons_layout.addWidget(cancel_button)

        layout.addLayout(buttons_layout)

        ok_button.clicked.connect(self.accept)
        cancel_button.clicked.connect(self.reject)

    def browse_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Server Folder")
        if folder:
            self.folder_input.setText(folder)

    def get_server_data(self):
        return {
            "name": self.name_input.text(),
            "command": self.command_input.text(),
            "args": self.args_input.text().split(),
            "folder": self.folder_input.text()
        }
