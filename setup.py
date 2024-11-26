from setuptools import setup, find_packages

setup(
    name="mcp_server_manager",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "PyQt5",
    ],
    entry_points={
        "console_scripts": [
            "mcp_server_manager=mcp_server_manager.__main__:main",
        ],
    },
)
