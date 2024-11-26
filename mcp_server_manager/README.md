# MCP Server Manager

This application allows you to manage MCP Servers on Windows 10/11 machines.

## Compiling with PyInstaller

To compile the MCP Server Manager for use on Windows 10/11 machines, follow these steps:

1. Ensure you have Python installed on your system (preferably Python 3.7 or later).

2. Install the required dependencies:
   ```
   pip install PyQt5 pyinstaller
   ```

3. Navigate to the root directory of the project (where `setup.py` is located).

4. Run the following command to create a single executable file:
   ```
   pyinstaller --name=MCPServerManager --windowed --add-data "mcp_server_manager/resources;resources" mcp_server_manager/__main__.py
   ```

   This command does the following:
   - `--name=MCPServerManager`: Sets the name of the output executable.
   - `--windowed`: Creates a Windows executable without a console window.
   - `--add-data "mcp_server_manager/resources;resources"`: Includes any resources your application might need.
   - `mcp_server_manager/__main__.py`: Specifies the entry point of your application.

5. After the process completes, you'll find the compiled executable in the `dist/MCPServerManager` directory.

6. To distribute the application, you can zip the entire `MCPServerManager` folder in the `dist` directory.

## Running the Compiled Application

1. Extract the zipped `MCPServerManager` folder to a location of your choice.

2. Double-click on `MCPServerManager.exe` to run the application.

Note: Ensure that the target Windows machine has the necessary permissions to create folders and files in the AppData directory, as the application will create a folder for storing server configurations.

## Troubleshooting

If you encounter any issues with missing dependencies when running the compiled application, you may need to include additional data or packages in the PyInstaller command. Refer to the [PyInstaller documentation](https://pyinstaller.readthedocs.io/en/stable/) for more advanced usage and troubleshooting tips.
